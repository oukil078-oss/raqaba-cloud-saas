import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { audit } from '../utils/audit';
import { paginationQuery, paging } from '../utils/validation';
import { UserRole } from '@prisma/client';

export function peopleRouter(kind: 'customers' | 'suppliers') {
  const router = Router();
  router.use(authenticate);
  const isCustomer = kind === 'customers';
  const model = isCustomer ? prisma.customer : prisma.supplier;
  const schema = isCustomer
    ? z.object({ name: z.string().min(2), phone: z.string().optional().nullable(), email: z.string().email().optional().nullable(), address: z.string().optional().nullable(), notes: z.string().optional().nullable() })
    : z.object({ name: z.string().min(2), contact: z.string().optional().nullable(), phone: z.string().optional().nullable(), email: z.string().email().optional().nullable(), address: z.string().optional().nullable(), notes: z.string().optional().nullable() });

  router.get('/', asyncHandler(async (req, res) => {
    const q = paginationQuery.parse(req.query);
    const where: any = { businessId: req.user!.businessId };
    if (q.q) where.OR = [{ name: { contains: q.q, mode: 'insensitive' } }, { phone: { contains: q.q, mode: 'insensitive' } }, { email: { contains: q.q, mode: 'insensitive' } }];
    const [data, total] = await Promise.all([
      (model as any).findMany({ where, orderBy: { updatedAt: 'desc' }, ...paging(q.page, q.limit) }),
      (model as any).count({ where })
    ]);
    res.json({ data, meta: { total, page: q.page, limit: q.limit } });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const include = isCustomer ? { sales: { include: { items: true }, orderBy: { createdAt: 'desc' }, take: 20 } } : { purchases: { include: { items: true }, orderBy: { createdAt: 'desc' }, take: 20 } };
    const data = await (model as any).findFirstOrThrow({ where: { id: req.params.id, businessId: req.user!.businessId }, include });
    res.json({ data });
  }));

  router.post('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
    const data = await (model as any).create({ data: { ...schema.parse(req.body), businessId: req.user!.businessId } });
    await audit(req, 'CREATE', isCustomer ? 'Customer' : 'Supplier', data.id, data);
    res.status(201).json({ data });
  }));

  router.patch('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
    const data = await (model as any).update({ where: { id: req.params.id, businessId: req.user!.businessId }, data: schema.partial().parse(req.body) });
    await audit(req, 'UPDATE', isCustomer ? 'Customer' : 'Supplier', data.id, data);
    res.json({ data });
  }));

  router.delete('/:id', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
    await (model as any).delete({ where: { id: req.params.id, businessId: req.user!.businessId } });
    await audit(req, 'DELETE', isCustomer ? 'Customer' : 'Supplier', req.params.id);
    res.status(204).send();
  }));
  return router;
}
