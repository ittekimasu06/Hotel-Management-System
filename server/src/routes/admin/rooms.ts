import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import { idParam, paged, pagingQuery } from "../../lib/paging.js";
import { serializeRoom } from "../../lib/serialize.js";
import { deleteImage, imageUpload, saveImage } from "../../lib/upload.js";

export const adminRoomsRouter = Router();

/** Trường số gửi qua multipart là chuỗi, cần ép kiểu */
const roomBody = z.object({
  hotelName: z.string().trim().min(1, "Hãy nhập tên khách sạn").max(100),
  address: z.string().trim().min(1, "Hãy nhập địa chỉ").max(200),
  typeId: z.coerce.number().int().positive("Hãy chọn loại phòng"),
  bedType: z.string().trim().min(1, "Hãy nhập loại giường").max(100),
  numberPeople: z.coerce.number().int().min(1, "Số người từ 1 đến 10").max(10, "Số người từ 1 đến 10"),
  numberBed: z.coerce.number().int().min(1, "Số giường từ 1 đến 10").max(10, "Số giường từ 1 đến 10"),
  quality: z.coerce.number().min(1, "Đánh giá từ 1 đến 5").max(5, "Đánh giá từ 1 đến 5"),
  price: z.coerce.number().min(0, "Giá không được âm").max(1_000_000_000),
  area: z.coerce.number().min(0, "Diện tích không được âm").max(100_000),
  status: z.coerce.number().int().min(1).max(3).default(1),
  detail: z.string().max(20_000).optional(),
});

async function ensureRoomType(typeId: number) {
  if (!(await prisma.roomType.findUnique({ where: { id: typeId } }))) {
    throw new HttpError(400, "Loại phòng không tồn tại");
  }
}

const listQuery = pagingQuery.extend({ key: z.string().trim().max(100).optional() });

adminRoomsRouter.get("/", async (req, res) => {
  const q = listQuery.parse(req.query);
  const where: Prisma.RoomWhereInput = q.key
    ? { OR: [{ hotelName: { contains: q.key } }, { address: { contains: q.key } }] }
    : {};
  const [total, rooms] = await prisma.$transaction([
    prisma.room.count({ where }),
    prisma.room.findMany({
      where,
      include: { type: true },
      orderBy: { id: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);
  res.json(paged(rooms.map(serializeRoom), q.page, q.pageSize, total));
});

adminRoomsRouter.get("/:id", async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: idParam.parse(req.params.id) }, include: { type: true } });
  if (!room) throw new HttpError(404, "Không tìm thấy phòng");
  res.json(serializeRoom(room));
});

adminRoomsRouter.post("/", imageUpload.single("image"), async (req, res) => {
  const body = roomBody.parse(req.body);
  if (!req.file) throw new HttpError(400, "Hãy chọn ảnh cho phòng");
  await ensureRoomType(body.typeId);

  const image = await saveImage(req.file);
  try {
    const room = await prisma.room.create({
      data: { ...body, detail: body.detail ?? null, image },
      include: { type: true },
    });
    res.status(201).json(serializeRoom(room));
  } catch (err) {
    await deleteImage(image);
    throw err;
  }
});

adminRoomsRouter.put("/:id", imageUpload.single("image"), async (req, res) => {
  const id = idParam.parse(req.params.id);
  const body = roomBody.parse(req.body);
  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Không tìm thấy phòng");
  await ensureRoomType(body.typeId);

  const newImage = req.file ? await saveImage(req.file) : null;
  try {
    const room = await prisma.room.update({
      where: { id },
      data: { ...body, detail: body.detail ?? null, ...(newImage ? { image: newImage } : {}) },
      include: { type: true },
    });
    if (newImage) await deleteImage(existing.image);
    res.json(serializeRoom(room));
  } catch (err) {
    if (newImage) await deleteImage(newImage);
    throw err;
  }
});

adminRoomsRouter.delete("/:id", async (req, res) => {
  const id = idParam.parse(req.params.id);
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new HttpError(404, "Không tìm thấy phòng");
  const bookings = await prisma.bill.count({ where: { roomId: id } });
  if (bookings > 0) {
    throw new HttpError(409, `Phòng đang có ${bookings} đơn đặt phòng, không thể xóa. Hãy chuyển trạng thái phòng thay vì xóa.`);
  }
  await prisma.room.delete({ where: { id } });
  await deleteImage(room.image);
  res.status(204).end();
});
