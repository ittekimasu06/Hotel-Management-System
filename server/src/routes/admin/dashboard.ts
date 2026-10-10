import { Router } from "express";
import { prisma } from "../../db.js";
import { nightsBetween } from "../../lib/dates.js";

export const adminDashboardRouter = Router();

/** Việt Nam lệch UTC +7, không có giờ mùa hè */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Thời điểm 00:00 ngày đầu tháng (giờ Việt Nam) đổi sang UTC. month tính từ 0, cho phép tràn năm. */
function monthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1) - VN_OFFSET_MS);
}

function vnNow() {
  const now = new Date(Date.now() + VN_OFFSET_MS);
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
}

/** Phần trăm thay đổi so với kỳ trước; null khi kỳ trước bằng 0 (không tính được) */
function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

adminDashboardRouter.get("/", async (_req, res) => {
  const { year, month } = vnNow();
  const thisYear = monthStart(year, 0);
  const nextYear = monthStart(year + 1, 0);
  const lastYear = monthStart(year - 1, 0);
  const thisMonth = monthStart(year, month);
  const nextMonth = monthStart(year, month + 1);
  const lastMonth = monthStart(year, month - 1);

  const [usersThisYear, usersLastYear, bookingsThisMonth, bookingsLastMonth, pendingBookings, unseenContacts, paidBills] =
    await prisma.$transaction([
      prisma.user.count({ where: { createdAt: { gte: thisYear, lt: nextYear } } }),
      prisma.user.count({ where: { createdAt: { gte: lastYear, lt: thisYear } } }),
      prisma.bill.count({ where: { createdAt: { gte: thisMonth, lt: nextMonth } } }),
      prisma.bill.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
      prisma.bill.count({ where: { statusId: 1, cancel: 0 } }),
      prisma.contact.count({ where: { seen: 0 } }),
      // Doanh thu: đơn đã thanh toán, chưa hủy, tạo từ đầu tháng trước hoặc đầu năm nay (lấy mốc sớm hơn)
      prisma.bill.findMany({
        where: {
          isPaid: true,
          cancel: 0,
          createdAt: { gte: lastMonth < thisYear ? lastMonth : thisYear, lt: nextYear },
        },
        select: { createdAt: true, startDate: true, endDate: true, numberRoom: true, room: { select: { price: true } } },
      }),
    ]);

  const revenueByMonth = Array<number>(12).fill(0);
  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  for (const b of paidBills) {
    const amount = nightsBetween(b.startDate, b.endDate) * b.room.price.toNumber() * (b.numberRoom ?? 1);
    const t = b.createdAt.getTime();
    if (t >= thisYear.getTime()) {
      revenueByMonth[new Date(t + VN_OFFSET_MS).getUTCMonth()] += amount;
    }
    if (t >= thisMonth.getTime() && t < nextMonth.getTime()) revenueThisMonth += amount;
    if (t >= lastMonth.getTime() && t < thisMonth.getTime()) revenueLastMonth += amount;
  }

  res.json({
    year,
    users: { current: usersThisYear, previous: usersLastYear, change: change(usersThisYear, usersLastYear) },
    bookings: { current: bookingsThisMonth, previous: bookingsLastMonth, change: change(bookingsThisMonth, bookingsLastMonth) },
    revenue: { current: revenueThisMonth, previous: revenueLastMonth, change: change(revenueThisMonth, revenueLastMonth) },
    pendingBookings,
    unseenContacts,
    revenueByMonth,
  });
});
