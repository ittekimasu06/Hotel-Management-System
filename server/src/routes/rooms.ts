import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { HttpError } from "../lib/http-error.js";
import { serializeRoom } from "../lib/serialize.js";

export const roomsRouter = Router();

const listQuery = z.object({
  key: z.string().trim().max(100).optional(),
  type: z.coerce.number().int().positive().optional(),
  address: z.string().trim().max(200).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(6),
});

const orderBy: Record<z.infer<typeof listQuery>["sort"], Prisma.RoomOrderByWithRelationInput> = {
  newest: { id: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

roomsRouter.get("/", async (req, res) => {
  const q = listQuery.parse(req.query);

  const where: Prisma.RoomWhereInput = {
    AND: [
      q.key
        ? {
            OR: [
              { hotelName: { contains: q.key } },
              { address: { contains: q.key } },
              { bedType: { contains: q.key } },
            ],
          }
        : {},
      q.type ? { typeId: q.type } : {},
      q.address ? { address: { contains: q.address } } : {},
      q.maxPrice ? { price: { lt: q.maxPrice } } : {},
    ],
  };

  const [total, rooms] = await prisma.$transaction([
    prisma.room.count({ where }),
    prisma.room.findMany({
      where,
      include: { type: true },
      orderBy: orderBy[q.sort],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({
    items: rooms.map(serializeRoom),
    page: q.page,
    pageSize: q.pageSize,
    total,
  });
});

/** Các địa điểm nổi bật trên trang chủ (giống bản PHP) */
const DESTINATIONS = ["Hạ Long", "Nha Trang", "Đà Lạt", "Đà Nẵng"];

roomsRouter.get("/destinations", async (_req, res) => {
  const counts = await prisma.$transaction(
    DESTINATIONS.map((name) => prisma.room.count({ where: { address: { contains: name } } })),
  );
  res.json(DESTINATIONS.map((name, i) => ({ name, count: counts[i] })));
});

roomsRouter.get("/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const room = await prisma.room.findUnique({ where: { id }, include: { type: true } });
  if (!room) {
    throw new HttpError(404, "Không tìm thấy phòng");
  }
  res.json(serializeRoom(room));
});
