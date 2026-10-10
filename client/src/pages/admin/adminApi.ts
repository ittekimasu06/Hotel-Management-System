import type { Booking, Room } from "../../api/client";

export type AdminBooking = Booking & { customerId: number };

export type AdminUser = {
  id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  permission: number;
  createdAt: string | null;
};

export type AdminContact = {
  id: number;
  fullname: string;
  email: string;
  subject: string;
  notes: string;
  seen: boolean;
  createdAt: string;
};

export type CatalogItem = { id: number; name: string; notes: string | null };

export type Trend = { current: number; previous: number; change: number | null };

export type Dashboard = {
  year: number;
  users: Trend;
  bookings: Trend;
  revenue: Trend;
  pendingBookings: number;
  unseenContacts: number;
  revenueByMonth: number[];
};

export type { Room };

export const ROOM_STATUS: Record<number, string> = {
  1: "Còn phòng trống",
  2: "Hết phòng",
  3: "Đang sửa chữa",
};

export function roleName(permission: number) {
  if (permission >= 5) return "Quản trị cấp cao";
  if (permission >= 1) return "Nhân viên";
  return "Khách hàng";
}

export const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
