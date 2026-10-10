import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import { idParam, paged, pagingQuery } from "../../lib/paging.js";
import { bookingInclude, serializeBooking } from "../bookings.js";

export const adminBookingsRouter = Router();

const listQuery = pagingQuery.extend({
  key: z.string().trim().max(100).optional(),
  statusId: z.coerce.number().int().positive().optional(),
  paid: z.enum(["true", "false"]).optional(),
  cancelled: z.enum(["true", "false"]).optional(),
});

const toAdminJson = (b: Parameters<typeof serializeBooking>[0]) => ({
  ...serializeBooking(b),
  customerId: b.customerId,
  canCancel: (b.cancel ?? 0) === 0,
});

adminBookingsRouter.get("/", async (req, res) => {
  const q = listQuery.parse(req.query);
  const and: Prisma.BillWhereInput[] = [];
  if (q.key) {
    const asId = Number(q.key.replace(/^#/, ""));
    and.push({
      OR: [
        ...(Number.isInteger(asId) && asId > 0 ? [{ id: asId }] : []),
        { fullname: { contains: q.key } },
        { email: { contains: q.key } },
        { phone: { contains: q.key } },
      ],
    });
  }
  if (q.statusId) and.push({ statusId: q.statusId });
  if (q.paid) and.push({ isPaid: q.paid === "true" });
  if (q.cancelled) and.push(q.cancelled === "true" ? { cancel: { not: 0 } } : { cancel: 0 });
  const where: Prisma.BillWhereInput = { AND: and };

  const [total, bills] = await prisma.$transaction([
    prisma.bill.count({ where }),
    prisma.bill.findMany({
      where,
      include: bookingInclude,
      orderBy: { id: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);
  res.json(paged(bills.map(toAdminJson), q.page, q.pageSize, total));
});

async function findBill(id: number) {
  const bill = await prisma.bill.findUnique({ where: { id }, include: bookingInclude });
  if (!bill) throw new HttpError(404, "Không tìm thấy đơn đặt phòng");
  return bill;
}

adminBookingsRouter.get("/:id", async (req, res) => {
  res.json(toAdminJson(await findBill(idParam.parse(req.params.id))));
});

const updateBody = z.object({
  statusId: z.number().int().positive(),
  isPaid: z.boolean(),
});

adminBookingsRouter.put("/:id", async (req, res) => {
  const bill = await findBill(idParam.parse(req.params.id));
  const body = updateBody.parse(req.body);
  if (!(await prisma.billStatus.findUnique({ where: { id: body.statusId } }))) {
    throw new HttpError(400, "Trạng thái không tồn tại");
  }
  const updated = await prisma.bill.update({
    where: { id: bill.id },
    data: {
      statusId: body.statusId,
      isPaid: body.isPaid,
      // Ghi nhận nhân viên xử lý đầu tiên (bản PHP yêu cầu nhập tay)
      staffName: bill.staffName || req.user!.fullname,
    },
    include: bookingInclude,
  });
  res.json(toAdminJson(updated));
});

adminBookingsRouter.post("/:id/cancel", async (req, res) => {
  const bill = await findBill(idParam.parse(req.params.id));
  if ((bill.cancel ?? 0) !== 0) throw new HttpError(409, "Đơn đã bị hủy trước đó");
  const updated = await prisma.bill.update({
    where: { id: bill.id },
    data: { cancel: 1, staffName: bill.staffName || req.user!.fullname },
    include: bookingInclude,
  });
  res.json(toAdminJson(updated));
});

adminBookingsRouter.delete("/:id", async (req, res) => {
  const bill = await findBill(idParam.parse(req.params.id));
  await prisma.bill.delete({ where: { id: bill.id } });
  res.status(204).end();
});
