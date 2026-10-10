import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, todayISO, type Booking, type Room } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const ROOM_AVAILABLE = 1;
const input = "form-control form-control-lg form-control-a";

/** Form đặt phòng theo bố cục của views/room.php */
export function BookingForm({ room }: { room: Room }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(todayISO());

  if (room.status !== ROOM_AVAILABLE) {
    return <p className="color-text-a">Phòng này hiện không nhận đặt.</p>;
  }

  if (!user) {
    return (
      <p className="color-text-a">
        Vui lòng{" "}
        <Link to="/login" state={{ from: location.pathname }}>
          đăng nhập
        </Link>{" "}
        để đặt phòng.
      </p>
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
    <form className="form-a" onSubmit={onSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-fullname" className="form-label">
            Họ và tên
          </label>
          <input id="b-fullname" name="fullname" className={input} placeholder="Họ và tên" defaultValue={user.fullname} required maxLength={100} />
        </div>
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-email" className="form-label">
            Email
          </label>
          <input id="b-email" name="email" type="email" className={input} placeholder="Email" defaultValue={user.email} required maxLength={45} />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-phone" className="form-label">
            Số điện thoại
          </label>
          <input id="b-phone" name="phone" type="tel" className={input} placeholder="Số điện thoại" defaultValue={user.phone ?? ""} required maxLength={20} />
        </div>
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-rooms" className="form-label">
            Số lượng phòng
          </label>
          <input id="b-rooms" name="numberRoom" type="number" min={1} max={5} className={input} placeholder="Số lượng phòng" defaultValue={1} required />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-adults" className="form-label">
            Số lượng người lớn
          </label>
          <input id="b-adults" name="numberAdult" type="number" min={0} max={10} className={input} placeholder="Số lượng người lớn" defaultValue={1} required />
        </div>
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-children" className="form-label">
            Số lượng trẻ nhỏ
          </label>
          <input id="b-children" name="numberChildren" type="number" min={0} max={10} className={input} placeholder="Số lượng trẻ nhỏ" defaultValue={0} required />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-start" className="form-label">
            Ngày bắt đầu
          </label>
          <input
            id="b-start"
            name="startDate"
            type="date"
            className={input}
            min={todayISO()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group col-md-6 mb-3">
          <label htmlFor="b-end" className="form-label">
            Ngày kết thúc
          </label>
          <input id="b-end" name="endDate" type="date" className={input} min={startDate || todayISO(1)} required />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-12 mb-3">
          <label htmlFor="b-notes" className="form-label">
            Ghi chú
          </label>
          <textarea id="b-notes" name="notes" className="form-control" rows={8} placeholder="Ghi chú" maxLength={2000} />
        </div>
      </div>
      <div className="row mt-3 d-flex justify-content-center">
        <div className="col-lg-3">
          <button type="submit" className="btn btn-a" disabled={submitting}>
            <i className="bi bi-send me-1" />
            {submitting ? "Đang gửi..." : "Đặt phòng"}
          </button>
        </div>
      </div>
    </form>
  );
}
