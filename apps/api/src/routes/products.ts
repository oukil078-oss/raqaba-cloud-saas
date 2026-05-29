import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { ProductStatus, MovementType, UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errors';
import { audit } from '../utils/audit';
import { decimal, paginationQuery, paging } from '../utils/validation';

const router = Router();
router.use(authenticate);

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const productSchema = z.object({
  name: z.string().min(2), sku: z.string().min(1), barcode: z.string().optional().nullable(), brand: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(), imageUrl: z.string().url().optional().nullable(), description: z.string().optional().nullable(),
  price: decimal, cost: decimal, stock: z.coerce.number().int().min(0).default(0), lowStockThreshold: z.coerce.number().int().min(0).default(5),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE)
});

router.get('/', asyncHandler(async (req, res) => {
  const query = paginationQuery.extend({ categoryId: z.string().optional(), status: z.nativeEnum(ProductStatus).optional(), lowStock: z.coerce.boolean().optional() }).parse(req.query);
  const where: any = { businessId: req.user!.businessId };
  if (query.status) where.status = query.status; else where.status = ProductStatus.ACTIVE;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.q) where.OR = [{ name: { contains: query.q, mode: 'insensitive' } }, { sku: { contains: query.q, mode: 'insensitive' } }, { barcode: { contains: query.q, mode: 'insensitive' } }, { brand: { contains: query.q, mode: 'insensitive' } }];
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: { updatedAt: 'desc' }, ...paging(query.page, query.limit) }),
    prisma.product.count({ where })
  ]);
  const result = query.lowStock ? data.filter((p) => p.stock <= p.lowStockThreshold) : data;
  res.json({ data: result, meta: { total: query.lowStock ? result.length : total, page: query.page, limit: query.limit } });
}));

router.get('/barcode/:code', asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { businessId: req.user!.businessId, OR: [{ barcode: req.params.code }, { sku: req.params.code }], status: ProductStatus.ACTIVE }, include: { category: true } });
  if (!product) throw new ApiError(404, 'لم يتم العثور على المنتج');
  res.json({ data: product });
}));

router.post('/upload', requireAtLeast(UserRole.MANAGER), upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'لم يتم رفع صورة');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}));

router.post('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const body = productSchema.parse(req.body);
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: { ...body, businessId: req.user!.businessId } });
    if (created.stock > 0) await tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: created.id, userId: req.user!.id, type: MovementType.STOCK_IN, quantity: created.stock, previousStock: 0, newStock: created.stock, reason: 'رصيد افتتاحي' } });
    return created;
  });
  await audit(req, 'CREATE', 'Product', product.id, product);
  res.status(201).json({ data: product });
}));

router.patch('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const body = productSchema.partial().parse(req.body);
  const current = await prisma.product.findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId } });
  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id: current.id }, data: body });
    if (typeof body.stock === 'number' && body.stock !== current.stock) {
      await tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: current.id, userId: req.user!.id, type: MovementType.ADJUSTMENT, quantity: body.stock - current.stock, previousStock: current.stock, newStock: body.stock, reason: 'تعديل يدوي للمخزون' } });
    }
    return updated;
  });
  await audit(req, 'UPDATE', 'Product', product.id, body);
  res.json({ data: product });
}));

router.delete('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id, businessId: req.user!.businessId }, data: { status: ProductStatus.ARCHIVED } });
  await audit(req, 'ARCHIVE', 'Product', product.id);
  res.json({ data: product });
}));

router.post('/:id/movements', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const schema = z.object({ type: z.enum(['STOCK_IN','STOCK_OUT','ADJUSTMENT']), quantity: z.coerce.number().int(), reason: z.string().optional(), note: z.string().optional() });
  const body = schema.parse(req.body);
  const product = await prisma.product.findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId } });
  const newStock = body.type === 'ADJUSTMENT' ? body.quantity : product.stock + (body.type === 'STOCK_IN' ? body.quantity : -body.quantity);
  if (newStock < 0) throw new ApiError(400, 'لا يمكن أن يصبح المخزون سالباً');
  const movement = await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: product.id }, data: { stock: newStock } });
    return tx.inventoryMovement.create({ data: { businessId: req.user!.businessId, productId: product.id, userId: req.user!.id, type: body.type as any, quantity: body.type === 'STOCK_OUT' ? -Math.abs(body.quantity) : body.quantity, previousStock: product.stock, newStock, reason: body.reason, note: body.note } });
  });
  await audit(req, 'STOCK_MOVEMENT', 'Product', product.id, movement);
  res.status(201).json({ data: movement });
}));

export default router;
