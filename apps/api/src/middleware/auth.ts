import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        businessId: string;
        role: UserRole;
        email: string;
        fullName: string;
      };
    }
  }
}

const roleRank: Record<UserRole, number> = { STAFF: 1, CASHIER: 2, MANAGER: 3, OWNER: 4 };

export function signToken(payload: { id: string; businessId: string; role: UserRole; email: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-only-secret-change-me', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
  } as any);
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new ApiError(401, 'يجب تسجيل الدخول أولاً');
    const token = auth.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-secret-change-me') as any;
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, isActive: true },
      select: { id: true, businessId: true, role: true, email: true, fullName: true }
    });
    if (!user) throw new ApiError(401, 'جلسة غير صالحة');
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'جلسة غير صالحة أو منتهية'));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'يجب تسجيل الدخول أولاً'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'ليست لديك صلاحية لتنفيذ هذه العملية'));
    next();
  };
}

export function requireAtLeast(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'يجب تسجيل الدخول أولاً'));
    if (roleRank[req.user.role] < roleRank[role]) return next(new ApiError(403, 'ليست لديك صلاحية كافية'));
    next();
  };
}
