import { Router, type Response } from "express";
import ExcelJS from "exceljs";
import { prisma } from "../../db.js";
import { nightsBetween, toISODate } from "../../lib/dates.js";

export const adminExportsRouter = Router();

type Column = { header: string; key: string; width?: number };

/**
 * Ghi workbook ra response. exceljs lưu chuỗi như dữ liệu văn bản (không phải công thức),
 * nên giá trị bắt đầu bằng "=" do người dùng nhập không bị Excel thực thi.
 */
async function sendWorkbook(res: Response, name: string, columns: Column[], rows: Record<string, unknown>[]) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet(name);
  sheet.columns = columns.map((c) => ({ ...c, width: c.width ?? 18 }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(rows);

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${name}-${date}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

adminExportsRouter.get("/bookings.xlsx", async (_req, res) => {
  const bills = await prisma.bill.findMany({
    include: { status: true, room: true },
    orderBy: { id: "asc" },
  });
  await sendWorkbook(
    res,
    "bookings",
    [
      { header: "Mã đơn", key: "id", width: 10 },
      { header: "Ngày tạo", key: "createdAt" },
      { header: "Khách hàng", key: "fullname", width: 25 },
      { header: "Email", key: "email", width: 28 },
      { header: "Điện thoại", key: "phone" },
      { header: "Khách sạn", key: "hotel", width: 30 },
      { header: "Nhận phòng", key: "startDate" },
      { header: "Trả phòng", key: "endDate" },
      { header: "Số phòng", key: "numberRoom", width: 10 },
      { header: "Người lớn", key: "numberAdult", width: 10 },
      { header: "Trẻ nhỏ", key: "numberChildren", width: 10 },
      { header: "Thành tiền ($)", key: "total" },
      { header: "Trạng thái", key: "status", width: 25 },
      { header: "Đã thanh toán", key: "paid" },
      { header: "Đã hủy", key: "cancelled", width: 10 },
      { header: "Nhân viên", key: "staffName", width: 22 },
      { header: "Ghi chú", key: "notes", width: 40 },
    ],
    bills.map((b) => ({
      id: b.id,
      createdAt: toISODate(b.createdAt),
      fullname: b.fullname,
      email: b.email,
      phone: b.phone,
      hotel: b.room.hotelName,
      startDate: toISODate(b.startDate),
      endDate: toISODate(b.endDate),
      numberRoom: b.numberRoom,
      numberAdult: b.numberAdult,
      numberChildren: b.numberChildren,
      total: nightsBetween(b.startDate, b.endDate) * b.room.price.toNumber() * (b.numberRoom ?? 1),
      status: b.status?.name ?? "",
      paid: b.isPaid ? "Có" : "Không",
      cancelled: (b.cancel ?? 0) !== 0 ? "Có" : "Không",
      staffName: b.staffName ?? "",
      notes: b.notes ?? "",
    })),
  );
});

adminExportsRouter.get("/users.xlsx", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  await sendWorkbook(
    res,
    "users",
    [
      { header: "ID", key: "id", width: 8 },
      { header: "Tên đăng nhập", key: "username", width: 20 },
      { header: "Họ tên", key: "fullname", width: 25 },
      { header: "Email", key: "email", width: 28 },
      { header: "Điện thoại", key: "phone" },
      { header: "Quyền", key: "permission", width: 10 },
      { header: "Ngày tạo", key: "createdAt" },
    ],
    // Không xuất mật khẩu
    users.map((u) => ({
      id: u.id,
      username: u.username,
      fullname: u.fullname,
      email: u.email,
      phone: u.phone ?? "",
      permission: u.permission ?? 0,
      createdAt: u.createdAt ? toISODate(u.createdAt) : "",
    })),
  );
});

adminExportsRouter.get("/contacts.xlsx", async (_req, res) => {
  const contacts = await prisma.contact.findMany({ orderBy: { id: "asc" } });
  await sendWorkbook(
    res,
    "contacts",
    [
      { header: "ID", key: "id", width: 8 },
      { header: "Ngày gửi", key: "createdAt" },
      { header: "Họ tên", key: "fullname", width: 25 },
      { header: "Email", key: "email", width: 28 },
      { header: "Tiêu đề", key: "subject", width: 30 },
      { header: "Nội dung", key: "notes", width: 60 },
      { header: "Đã xem", key: "seen", width: 10 },
    ],
    contacts.map((c) => ({
      id: c.id,
      createdAt: toISODate(c.createdAt),
      fullname: c.fullname,
      email: c.email,
      subject: c.subject,
      notes: c.notes,
      seen: (c.seen ?? 0) !== 0 ? "Có" : "Không",
    })),
  );
});
