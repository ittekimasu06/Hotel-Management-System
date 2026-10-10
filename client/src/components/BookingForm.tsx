import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, todayISO, type Booking, type Room } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const ROOM_AVAILABLE = 1;

export function BookingForm({ room }: { room: Room }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(todayISO());

  if (room.status !== ROOM_AVAILABLE) {
    return <div className="alert alert-secondary mt-3">Phòng này hiện không nhận đặt.</div>;
  }

  if (!user) {
    return (
      <div className="alert alert-info mt-3">
        <Link to="/login" state={{ from: location.pathname }}>
          Đăng nhập
        </Link>{" "}
        để đặt phòng.
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    const int = (k: string) => Number(form.get(k) ?? 0);
    setError(null);
    setSubmitting(true);
    try {
      const booking = await api<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId: room.id,
          fullname: text("fullname"),
          email: text("email"),
          phone: text("phone"),
          numberRoom: int("numberRoom"),
          numberAdult: int("numberAdult"),
          numberChildren: int("numberChildren"),
          startDate: text("startDate"),
          endDate: text("endDate"),
          notes: text("notes") || undefined,
        }),
      });
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form className="card card-body mt-3" onSubmit={onSubmit}>
      <h2 className="h5">Đặt phòng</h2>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-2">
        <div className="col-12">
          <label className="form-label small mb-1" htmlFor="b-fullname">
            Họ và tên
          </label>
          <input id="b-fullname" name="fullname" className="form-control" defaultValue={user.fullname} required maxLength={100} />
        </div>
        <div className="col-sm-7">
          <label className="form-label small mb-1" htmlFor="b-email">
            Email
          </label>
          <input id="b-email" name="email" type="email" className="form-control" defaultValue={user.email} required maxLength={45} />
        </div>
        <div className="col-sm-5">
          <label className="form-label small mb-1" htmlFor="b-phone">
            Số điện thoại
          </label>
          <input id="b-phone" name="phone" type="tel" className="form-control" defaultValue={user.phone ?? ""} required maxLength={20} />
        </div>
        <div className="col-4">
          <label className="form-label small mb-1" htmlFor="b-rooms">
            Số phòng
          </label>
          <input id="b-rooms" name="numberRoom" type="number" className="form-control" min={1} max={5} defaultValue={1} required />
        </div>
        <div className="col-4">
          <label className="form-label small mb-1" htmlFor="b-adults">
            Người lớn
          </label>
          <input id="b-adults" name="numberAdult" type="number" className="form-control" min={0} max={10} defaultValue={1} required />
        </div>
        <div className="col-4">
          <label className="form-label small mb-1" htmlFor="b-children">
            Trẻ nhỏ
          </label>
          <input id="b-children" name="numberChildren" type="number" className="form-control" min={0} max={10} defaultValue={0} required />
        </div>
        <div className="col-6">
          <label className="form-label small mb-1" htmlFor="b-start">
            Ngày nhận phòng
          </label>
          <input
            id="b-start"
            name="startDate"
            type="date"
            className="form-control"
            min={todayISO()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="col-6">
          <label className="form-label small mb-1" htmlFor="b-end">
            Ngày trả phòng
          </label>
          <input id="b-end" name="endDate" type="date" className="form-control" min={startDate || todayISO(1)} required />
        </div>
        <div className="col-12">
          <label className="form-label small mb-1" htmlFor="b-notes">
            Ghi chú
          </label>
          <textarea id="b-notes" name="notes" className="form-control" rows={2} maxLength={2000} />
        </div>
      </div>
      <button className="btn btn-success mt-3" disabled={submitting}>
        {submitting ? "Đang gửi..." : "Đặt phòng"}
      </button>
    </form>
  );
}
