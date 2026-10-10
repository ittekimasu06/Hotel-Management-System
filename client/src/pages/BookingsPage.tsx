import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, type Booking } from "../api/client";
import { BookingStatus } from "../components/BookingStatus";

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Booking[]>("/bookings")
      .then(setBookings)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function cancel(booking: Booking) {
    if (!window.confirm(`Hủy đơn đặt phòng #${booking.id} tại ${booking.room.hotelName}?`)) return;
    try {
      const updated = await api<Booking>(`/bookings/${booking.id}/cancel`, { method: "POST" });
      setBookings((list) => list?.map((b) => (b.id === updated.id ? updated : b)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <h1 className="h3 mb-3">Đơn đặt phòng của tôi</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {!bookings && !error && <p>Đang tải...</p>}
      {bookings?.length === 0 && (
        <p>
          Bạn chưa có đơn đặt phòng nào. <Link to="/rooms">Tìm phòng</Link>
        </p>
      )}

      <div className="list-group">
        {bookings?.map((b) => (
          <div key={b.id} className={`list-group-item border-start border-4 ${b.cancelled ? "border-danger" : "border-success"}`}>
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div>
                <Link to={`/bookings/${b.id}`} className="fw-bold text-decoration-none">
                  #{b.id} · {b.room.hotelName}
                </Link>
                <div className="small text-muted">
                  {formatDate(b.startDate)} → {formatDate(b.endDate)} · {b.nights} đêm · {b.numberRoom} phòng · Đặt ngày{" "}
                  {formatDate(b.createdAt)}
                </div>
                <div className="mt-1">
                  <BookingStatus booking={b} />
                </div>
              </div>
              <div className="text-end">
                <div className="fw-bold text-success">${b.total}</div>
                <div className="mt-2 d-flex gap-2 justify-content-end">
                  <Link to={`/bookings/${b.id}`} className="btn btn-outline-primary btn-sm">
                    Xem phiếu
                  </Link>
                  {b.canCancel && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(b)}>
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
