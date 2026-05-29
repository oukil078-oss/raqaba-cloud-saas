import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireAtLeast } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errors';
import { audit } from '../utils/audit';

const router = Router();
router.use(authenticate, requireAtLeast(UserRole.MANAGER));
const schema = z.object({ fullName: z.string().min(2), email: z.string().email(), phone: z.string().optional().nullable(), role: z.nativeEnum(UserRole).default('STAFF'), password: z.string().min(8).optional(), isActive: z.boolean().optional() });

router.get('/', asyncHandler(async (req, res) => {
  const data = await prisma.user.findMany({ where: { businessId: req.user!.businessId }, select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, lastLoginAt: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
  res.json({ data });
}));
router.post('/', asyncHandler(async (req, res) => {
  const body = schema.parse(req.body);
  if (req.user!.role !== 'OWNER' && ['OWNER','MANAGER'].includes(body.role)) throw new ApiError(403, 'فقط المالك يمكنه إنشاء مديرين');
  const passwordHash = await bcrypt.hash(body.password || 'ChangeMe123!', 12);
  const user = await prisma.user.create({ data: { businessId: req.user!.businessId, fullName: body.fullName, email: body.email.toLowerCase(), phone: body.phone, role: body.role, passwordHash, isActive: body.isActive ?? true } });
  await audit(req, 'CREATE', 'User', user.id, { role: user.role });
  const { passwordHash: _, ...safe } = user;
  res.status(201).json({ data: safe, temporaryPassword: body.password ? undefined : 'ChangeMe123!' });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  const body = schema.partial().parse(req.body);
  const data: any = { ...body };
  if (body.password) { data.passwordHash = await bcrypt.hash(body.password, 12); delete data.password; }
  const user = await prisma.user.update({ where: { id: req.params.id, businessId: req.user!.businessId }, data });
  await audit(req, 'UPDATE', 'User', user.id, data);
  const { passwordHash: _, ...safe } = user;
  res.json({ data: safe });
}));
export default router;
