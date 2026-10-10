export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // FormData (upload file) để trình duyệt tự đặt Content-Type multipart kèm boundary;
  // mọi request khác gửi JSON (server bắt buộc để chống CSRF)
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...init,
    headers: isForm ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? "Có lỗi xảy ra");
  }
  return body as T;
}

export type RoomType = { id: number; name: string; notes: string | null };

export type Room = {
  id: number;
  hotelName: string;
  address: string;
  bedType: string | null;
  numberPeople: number | null;
  numberBed: number | null;
  quality: number | null;
  price: number;
  area: number;
  status: number | null;
  detail: string | null;
  image: string | null;
  type: { id: number; name: string } | null;
};

export type Paged<T> = { items: T[]; page: number; pageSize: number; total: number };

export type Booking = {
  id: number;
  createdAt: string;
  fullname: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  numberRoom: number;
  numberAdult: number;
  numberChildren: number;
  notes: string | null;
  status: { id: number; name: string } | null;
  isPaid: boolean;
  cancelled: boolean;
  staffName: string | null;
  nights: number;
  total: number;
  canCancel: boolean;
  room: Room;
};

export type Destination = { name: string; count: number };

/**
 * Hiển thị ngày dạng dd/mm/yyyy. "YYYY-MM-DD" (ngày nhận/trả phòng) giữ nguyên ngày;
 * chuỗi ISO có giờ (thời điểm tạo) được đổi sang giờ Việt Nam.
 */
export function formatDate(value: string): string {
  if (value.length === 10) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  return new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (dùng cho input type="date") */
export function todayISO(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
}
