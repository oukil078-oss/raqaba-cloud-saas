import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { paginationQuery, paging } from '../utils/validation';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

router.get('/movements', asyncHandler(async (req, res) => {
  const q = paginationQuery.extend({ productId: z.string().optional(), type: z.string().optional() }).parse(req.query);
  const where: any = { businessId: req.user!.businessId };
  if (q.productId) where.productId = q.productId;
  if (q.type) where.type = q.type;
  const [data, total] = await Promise.all([
    prisma.inventoryMovement.findMany({ where, include: { product: true, user: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, ...paging(q.page, q.limit) }),
    prisma.inventoryMovement.count({ where })
  ]);
  res.json({ data, meta: { total, page: q.page, limit: q.limit } });
}));

router.get('/low-stock', asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ where: { businessId: req.user!.businessId, status: 'ACTIVE' }, include: { category: true }, orderBy: { stock: 'asc' } });
  res.json({ data: products.filter((p) => p.stock <= p.lowStockThreshold) });
}));

router.get('/valuation', asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ where: { businessId: req.user!.businessId, status: 'ACTIVE' }, select: { stock: true, cost: true, price: true } });
  const costValue = products.reduce((sum, p) => sum + Number(p.cost) * p.stock, 0);
  const retailValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  res.json({ data: { skuCount: products.length, units: products.reduce((s,p)=>s+p.stock,0), costValue, retailValue, potentialMargin: retailValue - costValue } });
}));

export default router;
