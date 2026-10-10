import { z } from "zod";

export const pagingQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export function paged<T>(items: T[], page: number, pageSize: number, total: number) {
  return { items, page, pageSize, total };
}

export const idParam = z.coerce.number().int().positive();
