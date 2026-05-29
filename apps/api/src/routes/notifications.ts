import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req,res)=>{
  const data = await prisma.notification.findMany({ where: { businessId: req.user!.businessId }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ data });
}));
router.patch('/:id/read', asyncHandler(async (req,res)=>{
  const data = await prisma.notification.update({ where: { id: req.params.id, businessId: req.user!.businessId }, data: { readAt: new Date() } });
  res.json({ data });
}));
export default router;
