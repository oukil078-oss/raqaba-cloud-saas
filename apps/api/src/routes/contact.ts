import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/errors';
const router = Router();
const schema = z.object({ name: z.string().min(2), phone: z.string().min(6), email: z.string().email().optional().or(z.literal('')), businessType: z.string().optional(), message: z.string().min(5) });
router.post('/', asyncHandler(async (req,res)=>{
  const body = schema.parse(req.body);
  console.info('New contact lead', { ...body, message: body.message.slice(0, 140) });
  res.status(201).json({ message: 'وصلتنا رسالتك. سيتواصل معك فريق رقابة قريباً.' });
}));
export default router;
