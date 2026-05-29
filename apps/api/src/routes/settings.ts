import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { audit } from '../utils/audit';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);
const schema = z.object({ name: z.string().min(2).optional(), phone: z.string().optional().nullable(), address: z.string().optional().nullable(), wilaya: z.string().optional().nullable(), currency: z.string().default('DZD').optional(), language: z.string().default('ar').optional(), theme: z.string().optional(), taxRate: z.coerce.number().min(0).max(100).optional() });
router.get('/', asyncHandler(async (req, res) => {
  const data = await prisma.business.findUniqueOrThrow({ where: { id: req.user!.businessId } });
  res.json({ data });
}));
router.patch('/', requireAtLeast(UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await prisma.business.update({ where: { id: req.user!.businessId }, data: schema.parse(req.body) });
  await audit(req, 'UPDATE', 'Business', data.id, data);
  res.json({ data });
}));
export default router;
