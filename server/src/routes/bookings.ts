import { Router } from "express";
import type { Bill, BillStatus, Room, RoomType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { DATE_PATTERN, dateOnly, nightsBetween, todayISO, toISODate } from "../lib/dates.js";
import { HttpError } from "../lib/http-error.js";
import { serializeRoom } from "../lib/serialize.js";
import { Permission, requireAuth, type AuthUser } from "../middleware/auth.js";

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

/** Trạng thái đơn mới tạo: "Chờ xử lý" (bảng tblbillstatic) */
const STATUS_PENDING = 1;
/** Trạng thái phòng có thể đặt: "Còn phòng trống" */
const ROOM_AVAILABLE = 1;

const createBody = z
  .object({
    roomId: z.number().int().positive(),
    fullname: z.string().trim().min(1, "Hãy nhập họ tên").max(100),
    email: z.string().trim().email("Email không hợp lệ").max(45),
    phone: z.string().trim().min(1, "Hãy nhập số điện thoại").max(20),
    numberRoom: z.number().int().min(1, "Số phòng từ 1 đến 5").max(5, "Số phòng từ 1 đến 5"),
    numberAdult: z.number().int().min(0).max(10, "Tối đa 10 người lớn"),
    numberChildren: z.number().int().min(0).max(10, "Tối đa 10 trẻ nhỏ"),
    startDate: z.string().regex(DATE_PATTERN, "Ngày nhận phòng không hợp lệ"),
    endDate: z.string().regex(DATE_PATTERN, "Ngày trả phòng không hợp lệ"),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((b) => b.numberAdult + b.numberChildren > 0, {
    message: "Phải có ít nhất một khách",
    path: ["numberAdult"],
  })
  .refine((b) => b.startDate >= todayISO(), {
    message: "Ngày nhận phòng không được ở trong quá khứ",
    path: ["startDate"],
  })
  .refine((b) => b.endDate > b.startDate, {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["endDate"],
  });

type BillWithRelations = Bill & { status: BillStatus | null; room: Room & { type: RoomType | null } };

function serializeBooking(bill: BillWithRelations) {
  const nights = nightsBetween(bill.startDate, bill.endDate);
  const price = bill.room.price.toNumber();
  const numberRoom = bill.numberRoom ?? 1;
  return {
    id: bill.id,
    createdAt: bill.createdAt.toISOString(),
    fullname: bill.fullname,
    email: bill.email,
    phone: bill.phone,
    startDate: toISODate(bill.startDate),
    endDate: toISODate(bill.endDate),
    numberRoom,
    numberAdult: bill.numberAdult ?? 0,
    numberChildren: bill.numberChildren ?? 0,
    notes: bill.notes,
    status: bill.status ? { id: bill.status.id, name: bill.status.name } : null,
    isPaid: Boolean(bill.isPaid),
    cancelled: (bill.cancel ?? 0) !== 0,
    staffName: bill.staffName,
    nights,
    total: nights * price * numberRoom,
    room: serializeRoom(bill.room),
  };
}

const include = { status: true, room: { include: { type: true } } } as const;

function canView(user: AuthUser, bill: Bill) {
  return bill.customerId === user.id || user.permission >= Permission.STAFF;
}

/** Khách chỉ được hủy đơn của mình khi chưa thanh toán; nhân viên hủy được mọi đơn */
function canCancel(user: AuthUser, bill: Bill) {
  if ((bill.cancel ?? 0) !== 0) return false;
  if (user.permission >= Permission.STAFF) return true;
  return bill.customerId === user.id && !bill.isPaid;
}

async function findBooking(id: number, user: AuthUser) {
  const bill = await prisma.bill.findUnique({ where: { id }, include });
  // Trả 404 thay vì 403 để không lộ việc đơn của người khác có tồn tại
  if (!bill || !canView(user, bill)) {
    throw new HttpError(404, "Không tìm thấy đơn đặt phòng");
  }
  return bill;
}

const idParam = z.coerce.number().int().positive();

bookingsRouter.get("/", async (req, res) => {
  const bills = await prisma.bill.findMany({
    where: { customerId: req.user!.id },
    include,
    orderBy: { id: "desc" },
  });
  res.json(bills.map((b) => ({ ...serializeBooking(b), canCancel: canCancel(req.user!, b) })));
});

bookingsRouter.get("/:id", async (req, res) => {
  const bill = await findBooking(idParam.parse(req.params.id), req.user!);
  res.json({ ...serializeBooking(bill), canCancel: canCancel(req.user!, bill) });
});

bookingsRouter.post("/", async (req, res) => {
  const body = createBody.parse(req.body);

  const room = await prisma.room.findUnique({ where: { id: body.roomId } });
  if (!room) {
    throw new HttpError(404, "Không tìm thấy phòng");
  }
  if (room.status !== ROOM_AVAILABLE) {
    throw new HttpError(409, "Phòng hiện không nhận đặt");
  }

  const bill = await prisma.bill.create({
    data: {
      roomId: room.id,
      customerId: req.user!.id,
      createdAt: new Date(),
      fullname: body.fullname,
      email: body.email,
      phone: body.phone,
      startDate: dateOnly(body.startDate),
      endDate: dateOnly(body.endDate),
      numberRoom: body.numberRoom,
      numberAdult: body.numberAdult,
      numberChildren: body.numberChildren,
      notes: body.notes || null,
      statusId: STATUS_PENDING,
      isPaid: false,
      cancel: 0,
    },
    include,
  });

  res.status(201).json({ ...serializeBooking(bill), canCancel: canCancel(req.user!, bill) });
});

bookingsRouter.post("/:id/cancel", async (req, res) => {
  const bill = await findBooking(idParam.parse(req.params.id), req.user!);
  if (!canCancel(req.user!, bill)) {
    throw new HttpError(409, "Không thể hủy đơn này");
  }
  const updated = await prisma.bill.update({ where: { id: bill.id }, data: { cancel: 1 }, include });
  res.json({ ...serializeBooking(updated), canCancel: false });
});
