import type { Request } from 'express';
import { prisma } from './prisma';

export async function audit(req: Request, action: string, entity: string, entityId?: string, metadata?: unknown) {
  if (!req.user) return;
  await prisma.auditLog.create({
    data: {
      businessId: req.user.businessId,
      userId: req.user.id,
      action,
      entity,
      entityId,
      metadata: metadata as any,
      ipAddress: req.ip
    }
  }).catch(() => undefined);
}
