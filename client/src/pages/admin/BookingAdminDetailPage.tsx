import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { BookingStatus } from "../../components/BookingStatus";
import { money, type AdminBooking, type CatalogItem } from "./adminApi";

export function BookingAdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [statuses, setStatuses] = useState<CatalogItem[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  useEffect(() => {
    api<AdminBooking>(`/admin/bookings/${id}`)
      .then(setBooking)
      .catch((e: Error) => setMessage({ type: "danger", text: e.message }));
    api<CatalogItem[]>("/admin/bill-statuses").then(setStatuses).catch(() => setStatuses([]));
  }, [id]);

  async function run(action: () => Promise<AdminBooking>, success: string) {
    try {
      setBooking(await action());
      setMessage({ type: "success", text: success });
    } catch (e) {
      setMessage({ type: "danger", text: (e as Error).message });
    }
  }

  function onUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = JSON.stringify({ statusId: Number(form.get("statusId")), isPaid: form.get("isPaid") === "true" });
    run(() => api<AdminBooking>(`/admin/bookings/${id}`, { method: "PUT", body }), "Đã cập nhật đơn");
  }

  function onCancel() {
    if (!window.confirm(`Hủy đơn #${id}?`)) return;
    run(() => api<AdminBooking>(`/admin/bookings/${id}/cancel`, { method: "POST" }), "Đã hủy đơn");
  }

  async function onDelete() {
    if (!window.confirm(`Xóa vĩnh viễn đơn #${id}? Thao tác này không thể hoàn tác.`)) return;
    try {
      await api(`/admin/bookings/${id}`, { method: "DELETE" });
      navigate("/admin/bookings");
    } catch (e) {
      setMessage({ type: "danger", text: (e as Error).message });
    }
  }

  if (!booking) return message ? <div className={`alert alert-${message.type}`}>{message.text}</div> : <p>Đang tải...</p>;
  const b = booking;

  return (
    <>
      <Link to="/admin/bookings" className="small">
        <i className="bi bi-arrow-left" /> Danh sách đơn
      </Link>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3">
        <h1 className="h4 mb-0">
          Đơn #{b.id} <BookingStatus booking={b} />
        </h1>
        <Link to={`/bookings/${b.id}`} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-printer me-1" />
          Phiếu xác nhận
        </Link>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-sm-4">Khách hàng</dt>
                <dd className="col-sm-8">{b.fullname}</dd>
                <dt className="col-sm-4">Email / SĐT</dt>
                <dd className="col-sm-8">
                  {b.email} · {b.phone}
                </dd>
                <dt className="col-sm-4">Khách sạn</dt>
                <dd className="col-sm-8">
                  <Link to={`/rooms/${b.room.id}`}>{b.room.hotelName}</Link>
                  <div className="small text-muted">
                    {b.room.type?.name} · {b.room.address}
                  </div>
                </dd>
                <dt className="col-sm-4">Lưu trú</dt>
                <dd className="col-sm-8">
                  {formatDate(b.startDate)} → {formatDate(b.endDate)} ({b.nights} đêm)
                </dd>
                <dt className="col-sm-4">Số phòng / khách</dt>
                <dd className="col-sm-8">
                  {b.numberRoom} phòng · {b.numberAdult} người lớn · {b.numberChildren} trẻ nhỏ
                </dd>
                <dt className="col-sm-4">Thành tiền</dt>
                <dd className="col-sm-8 fw-semibold">
                  {money(b.total)} <span className="small text-muted fw-normal">({money(b.room.price)} × {b.nights} đêm × {b.numberRoom} phòng)</span>
                </dd>
                <dt className="col-sm-4">Ngày đặt</dt>
                <dd className="col-sm-8">{formatDate(b.createdAt)}</dd>
                <dt className="col-sm-4">Nhân viên xử lý</dt>
                <dd className="col-sm-8">{b.staffName ?? "—"}</dd>
                {b.notes && (
                  <>
                    <dt className="col-sm-4">Ghi chú</dt>
                    <dd className="col-sm-8" style={{ whiteSpace: "pre-wrap" }}>
                      {b.notes}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <form className="card card-body mb-3" onSubmit={onUpdate} key={`${b.status?.id}-${b.isPaid}`}>
            <h2 className="h6">Cập nhật xử lý</h2>
            <label className="form-label small mb-1" htmlFor="statusId">
              Trạng thái
            </label>
            <select id="statusId" name="statusId" className="form-select form-select-sm mb-2" defaultValue={b.status?.id ?? 1} disabled={b.cancelled}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="form-label small mb-1" htmlFor="isPaid">
              Thanh toán
            </label>
            <select id="isPaid" name="isPaid" className="form-select form-select-sm mb-3" defaultValue={String(b.isPaid)} disabled={b.cancelled}>
              <option value="false">Chưa thanh toán</option>
              <option value="true">Đã thanh toán</option>
            </select>
            <button className="btn btn-success btn-sm" disabled={b.cancelled}>
              Lưu
            </button>
            {!b.staffName && <div className="form-text">Tên của bạn sẽ được ghi là nhân viên xử lý đơn này.</div>}
          </form>

          <div className="card card-body">
            <h2 className="h6">Thao tác khác</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-warning btn-sm" onClick={onCancel} disabled={b.cancelled}>
                Hủy đơn
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>
                Xóa đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
