import type { Booking } from "../api/client";

export function BookingStatus({ booking }: { booking: Booking }) {
  if (booking.cancelled) {
    return <span className="badge text-bg-danger">Đã hủy</span>;
  }
  return (
    <>
      <span className="badge text-bg-primary me-1">{booking.status?.name ?? "Không rõ"}</span>
      <span className={`badge ${booking.isPaid ? "text-bg-success" : "text-bg-warning"}`}>
        {booking.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
      </span>
    </>
  );
}
