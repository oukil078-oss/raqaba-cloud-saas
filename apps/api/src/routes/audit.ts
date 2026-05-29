import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req,res)=>{
  const data = await prisma.auditLog.findMany({ where: { businessId: req.user!.businessId }, include: { user: { select: { fullName: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ data });
}));
export default router;
