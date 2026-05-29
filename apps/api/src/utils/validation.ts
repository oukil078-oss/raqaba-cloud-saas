import { z } from 'zod';

export const idParam = z.object({ id: z.string().min(8) });
export const paginationQuery = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

export function paging(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export const decimal = z.coerce.number().finite().min(0);
export const optionalString = z.string().trim().optional().nullable();
