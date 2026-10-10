const TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 24 * 60 * 60 * 1000;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD */
export function todayISO(): string {
  // Locale en-CA định dạng ngày theo YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/**
 * Chuyển "YYYY-MM-DD" thành Date lúc 00:00 UTC. Prisma ghi Date vào cột DATETIME theo UTC
 * nên giá trị lưu xuống là "YYYY-MM-DD 00:00:00", giống dữ liệu bản PHP tạo ra.
 */
export function dateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Date đọc từ cột DATETIME (UTC) thành "YYYY-MM-DD" */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Số đêm giữa hai ngày */
export function nightsBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_MS));
}
