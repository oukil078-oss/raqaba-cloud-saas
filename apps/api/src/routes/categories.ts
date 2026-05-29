import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { audit } from '../utils/audit';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);
const schema = z.object({ name: z.string().min(2), description: z.string().optional().nullable(), color: z.string().default('#2563eb'), icon: z.string().default('box') });

router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ where: { businessId: req.user!.businessId }, include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
  res.json({ data: categories });
}));
router.post('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const category = await prisma.category.create({ data: { ...schema.parse(req.body), businessId: req.user!.businessId } });
  await audit(req, 'CREATE', 'Category', category.id, category);
  res.status(201).json({ data: category });
}));
router.patch('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id, businessId: req.user!.businessId }, data: schema.partial().parse(req.body) });
  await audit(req, 'UPDATE', 'Category', category.id, category);
  res.json({ data: category });
}));
router.delete('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id, businessId: req.user!.businessId } });
  await audit(req, 'DELETE', 'Category', req.params.id);
  res.status(204).send();
}));
export default router;
