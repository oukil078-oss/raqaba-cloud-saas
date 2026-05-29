import { Router } from 'express';
import { ExpenseCategory, UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { audit } from '../utils/audit';
import { decimal, paginationQuery, paging } from '../utils/validation';

const router = Router();
router.use(authenticate);
const schema = z.object({ title: z.string().min(2), category: z.nativeEnum(ExpenseCategory).default('OTHER'), amount: decimal, paidAt: z.coerce.date().optional(), note: z.string().optional().nullable() });

router.get('/', asyncHandler(async (req, res) => {
  const q = paginationQuery.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), category: z.nativeEnum(ExpenseCategory).optional() }).parse(req.query);
  const where: any = { businessId: req.user!.businessId };
  if (q.q) where.title = { contains: q.q, mode: 'insensitive' };
  if (q.category) where.category = q.category;
  if (q.from || q.to) where.paidAt = { gte: q.from, lte: q.to };
  const [data, total] = await Promise.all([prisma.expense.findMany({ where, orderBy: { paidAt: 'desc' }, ...paging(q.page, q.limit) }), prisma.expense.count({ where })]);
  res.json({ data, meta: { total, page: q.page, limit: q.limit } });
}));
router.post('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await prisma.expense.create({ data: { ...schema.parse(req.body), businessId: req.user!.businessId } });
  await audit(req, 'CREATE', 'Expense', data.id, data);
  res.status(201).json({ data });
}));
router.patch('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await prisma.expense.update({ where: { id: req.params.id, businessId: req.user!.businessId }, data: schema.partial().parse(req.body) });
  await audit(req, 'UPDATE', 'Expense', data.id, data);
  res.json({ data });
}));
router.delete('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  await prisma.expense.delete({ where: { id: req.params.id, businessId: req.user!.businessId } });
  await audit(req, 'DELETE', 'Expense', req.params.id);
  res.status(204).send();
}));
export default router;
