import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({ message: 'البيانات غير صحيحة', errors: err.flatten() });
  }
  if (err?.code === 'P2002') {
    return res.status(409).json({ message: 'هذا السجل موجود مسبقاً', target: err.meta?.target });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ message: 'السجل غير موجود' });
  }
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'حدث خطأ غير متوقع';
  if (status === 500) console.error(err);
  return res.status(status).json({ message, details: err.details });
}
