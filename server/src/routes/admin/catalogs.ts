import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import { idParam } from "../../lib/paging.js";

const body = z.object({
  name: z.string().trim().min(1, "Hãy nhập tên").max(45, "Tên tối đa 45 ký tự"),
  notes: z.string().trim().max(5000).optional(),
});

type Item = { id: number; name: string; notes: string | null };

/**
 * Danh mục đơn giản gồm tên và ghi chú (loại phòng, trạng thái đơn).
 * Không cho xóa mục đang được dùng, vì database không có khóa ngoại để chặn.
 */
function catalogRouter(opts: {
  label: string;
  list: () => Promise<Item[]>;
  find: (id: number) => Promise<Item | null>;
  create: (data: { name: string; notes: string | null }) => Promise<Item>;
  update: (id: number, data: { name: string; notes: string | null }) => Promise<Item>;
  remove: (id: number) => Promise<unknown>;
  usage: (id: number) => Promise<number>;
  protectedIds?: number[];
}) {
  const router = Router();
  const toJson = (i: Item) => ({ id: i.id, name: i.name, notes: i.notes });

  router.get("/", async (_req, res) => {
    res.json((await opts.list()).map(toJson));
  });

  router.post("/", async (req, res) => {
    const b = body.parse(req.body);
    res.status(201).json(toJson(await opts.create({ name: b.name, notes: b.notes || null })));
  });

  router.put("/:id", async (req, res) => {
    const id = idParam.parse(req.params.id);
    const b = body.parse(req.body);
    if (!(await opts.find(id))) throw new HttpError(404, `Không tìm thấy ${opts.label}`);
    res.json(toJson(await opts.update(id, { name: b.name, notes: b.notes || null })));
  });

  router.delete("/:id", async (req, res) => {
    const id = idParam.parse(req.params.id);
    if (!(await opts.find(id))) throw new HttpError(404, `Không tìm thấy ${opts.label}`);
    if (opts.protectedIds?.includes(id)) {
      throw new HttpError(409, `Không thể xóa ${opts.label} mặc định của hệ thống`);
    }
    const used = await opts.usage(id);
    if (used > 0) throw new HttpError(409, `Không thể xóa: đang được dùng bởi ${used} bản ghi`);
    await opts.remove(id);
    res.status(204).end();
  });

  return router;
}

export const adminRoomTypesRouter = catalogRouter({
  label: "loại phòng",
  list: () => prisma.roomType.findMany({ orderBy: { id: "asc" } }),
  find: (id) => prisma.roomType.findUnique({ where: { id } }),
  create: (data) => prisma.roomType.create({ data }),
  update: (id, data) => prisma.roomType.update({ where: { id }, data }),
  remove: (id) => prisma.roomType.delete({ where: { id } }),
  usage: (id) => prisma.room.count({ where: { typeId: id } }),
});

export const adminBillStatusesRouter = catalogRouter({
  label: "trạng thái",
  list: () => prisma.billStatus.findMany({ orderBy: { id: "asc" } }),
  find: (id) => prisma.billStatus.findUnique({ where: { id } }),
  create: (data) => prisma.billStatus.create({ data }),
  update: (id, data) => prisma.billStatus.update({ where: { id }, data }),
  remove: (id) => prisma.billStatus.delete({ where: { id } }),
  usage: (id) => prisma.bill.count({ where: { statusId: id } }),
  // Trạng thái 1 ("Chờ xử lý") được gán cho mọi đơn mới
  protectedIds: [1],
});
