import { Router } from 'express';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { asyncHandler, ApiError } from '../utils/errors';
import { authenticate, signToken } from '../middleware/auth';
import { audit } from '../utils/audit';

const router = Router();

const registerSchema = z.object({
  businessName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  wilaya: z.string().optional()
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/register', asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) throw new ApiError(409, 'البريد الإلكتروني مستعمل مسبقاً');
  const baseSlug = slugify(body.businessName, { lower: true, strict: true }) || `business-${Date.now()}`;
  const passwordHash = await bcrypt.hash(body.password, 12);

  const created = await prisma.$transaction(async (tx) => {
    let slug = baseSlug;
    let i = 1;
    while (await tx.business.findUnique({ where: { slug } })) slug = `${baseSlug}-${i++}`;
    const business = await tx.business.create({ data: { name: body.businessName, slug, phone: body.phone, wilaya: body.wilaya || 'الجزائر' } });
    const user = await tx.user.create({
      data: { businessId: business.id, email: body.email.toLowerCase(), fullName: body.fullName, phone: body.phone, passwordHash, role: UserRole.OWNER }
    });
    const defaults = ['ملابس', 'عطور وتجميل', 'إلكترونيات', 'إكسسوارات'];
    await tx.category.createMany({ data: defaults.map((name, idx) => ({ businessId: business.id, name, color: ['#2563eb','#06b6d4','#8b5cf6','#f59e0b'][idx], icon: ['shirt','sparkles','smartphone','gift'][idx] })) });
    return { business, user };
  });

  const token = signToken({ id: created.user.id, businessId: created.business.id, role: created.user.role, email: created.user.email });
  res.status(201).json({ token, user: sanitizeUser(created.user), business: created.business });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() }, include: { business: true } });
  if (!user || !user.isActive) throw new ApiError(401, 'بيانات الدخول غير صحيحة');
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'بيانات الدخول غير صحيحة');
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = signToken({ id: user.id, businessId: user.businessId, role: user.role, email: user.email });
  res.json({ token, user: sanitizeUser(user), business: user.business });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { business: true } });
  if (!user) throw new ApiError(404, 'المستخدم غير موجود');
  res.json({ user: sanitizeUser(user), business: user.business });
}));

router.patch('/profile', authenticate, asyncHandler(async (req, res) => {
  const schema = z.object({ fullName: z.string().min(2).optional(), phone: z.string().optional().nullable(), password: z.string().min(8).optional() });
  const body = schema.parse(req.body);
  const data: any = { ...body };
  if (body.password) {
    data.passwordHash = await bcrypt.hash(body.password, 12);
    delete data.password;
  }
  const user = await prisma.user.update({ where: { id: req.user!.id }, data });
  await audit(req, 'UPDATE_PROFILE', 'User', user.id);
  res.json({ user: sanitizeUser(user) });
}));

router.post('/logout', authenticate, (_req, res) => res.json({ message: 'تم تسجيل الخروج' }));

function sanitizeUser(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export default router;
