import { Router } from 'express';
import { z } from 'zod';
import { MovementType, PaymentMethod, SaleStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errors';
import { audit } from '../utils/audit';
import { decimal, paginationQuery, paging } from '../utils/validation';

const router = Router();
router.use(authenticate);

const itemSchema = z.object({ productId: z.string(), quantity: z.coerce.number().int().positive(), unitPrice: decimal.optional(), discount: decimal.default(0) });
const saleSchema = z.object({ customerId: z.string().optional().nullable(), items: z.array(itemSchema).min(1), discount: decimal.default(0), tax: decimal.default(0), paymentMethod: z.nativeEnum(PaymentMethod).default('CASH'), note: z.string().optional().nullable() });

router.get('/', asyncHandler(async (req, res) => {
  const q = paginationQuery.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), status: z.nativeEnum(SaleStatus).optional() }).parse(req.query);
  const where: any = { businessId: req.user!.businessId };
  if (q.q) where.invoiceNumber = { contains: q.q, mode: 'insensitive' };
  if (q.status) where.status = q.status;
  if (q.from || q.to) where.createdAt = { gte: q.from, lte: q.to };
  const [data, total] = await Promise.all([
    prisma.sale.findMany({ where, include: { customer: true, user: { select: { fullName: true } }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, ...paging(q.page, q.limit) }),
    prisma.sale.count({ where })
  ]);
  res.json({ data, meta: { total, page: q.page, limit: q.limit } });
}));

router.post('/', asyncHandler(async (req, res) => {
  const body = saleSchema.parse(req.body);
  const sale = await prisma.$transaction(async (tx) => {
    const ids = body.items.map(i => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: ids }, businessId: req.user!.businessId, status: 'ACTIVE' } });
    if (products.length !== ids.length) throw new ApiError(404, 'بعض المنتجات غير موجودة');
    const byId = new Map(products.map(p => [p.id, p]));
    for (const item of body.items) {
      const product = byId.get(item.productId)!;
      if (product.stock < item.quantity) throw new ApiError(400, `المخزون غير كافٍ للمنتج: ${product.name}`);
    }
    const normalized = body.items.map((item) => {
      const p = byId.get(item.productId)!;
      const unitPrice = item.unitPrice ?? Number(p.price);
      return { product: p, quantity: item.quantity, unitPrice, cost: Number(p.cost), discount: item.discount, total: Math.max(0, unitPrice * item.quantity - item.discount) };
    });
    const subtotal = normalized.reduce((s, i) => s + i.total, 0);
    const total = Math.max(0, subtotal - body.discount + body.tax);
    const count = await tx.sale.count({ where: { businessId: req.user!.businessId } });
    const invoiceNumber = `RC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const sale = await tx.sale.create({ data: { businessId: req.user!.businessId, customerId: body.customerId || undefined, userId: req.user!.id, invoiceNumber, subtotal, discount: body.discount, tax: body.tax, total, paymentMethod: body.paymentMethod, note: body.note, items: { create: normalized.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.unitPrice, cost: i.cost, discount: i.discount, total: i.total })) } }, include: { items: { include: { product: true } }, customer: true, user: { select: { fullName: true } } } });
    for (const i of normalized) {
      const previousStock = i.product.stock;
      const newStock = previousStock - i.quantity;
      await tx.product.update({ where: { id: i.product.id }, data: { stock: newStock } });
      await tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: i.product.id, userId: req.user!.id, type: MovementType.SALE, quantity: -i.quantity, previousStock, newStock, referenceType: 'Sale', referenceId: sale.id, reason: `بيع ${invoiceNumber}` } });
      if (newStock <= i.product.lowStockThreshold) await tx.notification.create({ data: { businessId: req.user!.businessId, type: 'LOW_STOCK', title: 'تنبيه مخزون منخفض', message: `${i.product.name} وصل إلى ${newStock} قطعة` } });
    }
    if (body.customerId) await tx.customer.update({ where: { id: body.customerId }, data: { totalSpent: { increment: total } } });
    await tx.notification.create({ data: { businessId: req.user!.businessId, type: 'SALE_CREATED', title: 'عملية بيع جديدة', message: `${invoiceNumber} بقيمة ${total.toLocaleString('fr-DZ')} دج` } });
    return sale;
  });
  await audit(req, 'CREATE', 'Sale', sale.id, { total: sale.total, items: sale.items.length });
  res.status(201).json({ data: sale });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.sale.findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId }, include: { customer: true, user: { select: { fullName: true } }, items: { include: { product: true } }, business: true } });
  res.json({ data });
}));

router.get('/:id/receipt', asyncHandler(async (req, res) => {
  const sale = await prisma.sale.findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId }, include: { customer: true, items: { include: { product: true } }, business: true } });
  res.json({ data: { invoiceNumber: sale.invoiceNumber, business: sale.business, customer: sale.customer, items: sale.items, subtotal: sale.subtotal, discount: sale.discount, tax: sale.tax, total: sale.total, createdAt: sale.createdAt, qrPayload: `SALE:${sale.invoiceNumber}:${sale.total}` } });
}));

router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const sale = await prisma.sale.findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId }, include: { items: { include: { product: true } } } });
  if (sale.status === 'CANCELLED') throw new ApiError(400, 'الفاتورة ملغاة مسبقاً');
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      const previousStock = item.product.stock;
      const newStock = previousStock + item.quantity;
      await tx.product.update({ where: { id: item.productId }, data: { stock: newStock } });
      await tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: item.productId, userId: req.user!.id, type: MovementType.RETURN, quantity: item.quantity, previousStock, newStock, referenceType: 'Sale', referenceId: sale.id, reason: 'إلغاء عملية بيع' } });
    }
    return tx.sale.update({ where: { id: sale.id }, data: { status: 'CANCELLED' } });
  });
  await audit(req, 'CANCEL', 'Sale', sale.id);
  res.json({ data: updated });
}));
export default router;
