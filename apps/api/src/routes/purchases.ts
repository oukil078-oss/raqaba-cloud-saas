import { Router } from 'express';
import { z } from 'zod';
import { MovementType, PurchaseStatus, UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errors';
import { audit } from '../utils/audit';
import { decimal, paginationQuery, paging } from '../utils/validation';

const router = Router();
router.use(authenticate);
const itemSchema = z.object({ productId: z.string(), quantity: z.coerce.number().int().positive(), unitCost: decimal });
const purchaseSchema = z.object({ supplierId: z.string().optional().nullable(), items: z.array(itemSchema).min(1), shippingCost: decimal.default(0), status: z.nativeEnum(PurchaseStatus).default('RECEIVED'), note: z.string().optional().nullable() });

router.get('/', asyncHandler(async (req, res) => {
  const q = paginationQuery.parse(req.query);
  const where: any = { businessId: req.user!.businessId };
  if (q.q) where.reference = { contains: q.q, mode: 'insensitive' };
  const [data,total] = await Promise.all([
    prisma.purchase.findMany({ where, include: { supplier: true, user: { select: { fullName: true } }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, ...paging(q.page,q.limit) }),
    prisma.purchase.count({ where })
  ]);
  res.json({ data, meta: { total, page: q.page, limit: q.limit } });
}));

router.post('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const body = purchaseSchema.parse(req.body);
  const purchase = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: body.items.map(i=>i.productId) }, businessId: req.user!.businessId } });
    if (products.length !== body.items.length) throw new ApiError(404, 'بعض المنتجات غير موجودة');
    const byId = new Map(products.map(p => [p.id, p]));
    const normalized = body.items.map(i => ({ ...i, product: byId.get(i.productId)!, total: i.quantity * i.unitCost }));
    const subtotal = normalized.reduce((s,i)=>s+i.total,0);
    const total = subtotal + body.shippingCost;
    const count = await tx.purchase.count({ where: { businessId: req.user!.businessId } });
    const reference = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const purchase = await tx.purchase.create({ data: { businessId: req.user!.businessId, supplierId: body.supplierId || undefined, userId: req.user!.id, reference, subtotal, shippingCost: body.shippingCost, total, status: body.status, receivedAt: body.status === 'RECEIVED' ? new Date() : undefined, note: body.note, items: { create: normalized.map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost, total: i.total })) } }, include: { items: { include: { product: true } }, supplier: true } });
    if (body.status === 'RECEIVED') {
      for (const i of normalized) {
        const previousStock = i.product.stock;
        const newStock = previousStock + i.quantity;
        await tx.product.update({ where: { id: i.productId }, data: { stock: newStock, cost: i.unitCost } });
        await tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: i.productId, userId: req.user!.id, type: MovementType.PURCHASE, quantity: i.quantity, previousStock, newStock, referenceType: 'Purchase', referenceId: purchase.id, reason: `استلام شراء ${reference}` } });
      }
    }
    return purchase;
  });
  await audit(req, 'CREATE', 'Purchase', purchase.id, { total: purchase.total });
  res.status(201).json({ data: purchase });
}));
export default router;
