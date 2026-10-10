import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import type { AdminBooking, CatalogItem } from "./adminApi";
import { Modal, PageCard, PageTitle } from "./ui";

/** Chi tiết và xử lý đơn, chuyển từ admin/bill.php */
export function BookingAdminDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [statuses, setStatuses] = useState<CatalogItem[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{ statusId: number; isPaid: boolean } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    api<AdminBooking>(`/admin/bookings/${id}`)
      .then((b) => {
        setBooking(b);
        setForm({ statusId: b.status?.id ?? 1, isPaid: b.isPaid });
      })
      .catch((e: Error) => setMessage({ ok: false, text: e.message }));
    api<CatalogItem[]>("/admin/bill-statuses").then(setStatuses).catch(() => setStatuses([]));
  }, [id]);

  async function run(action: () => Promise<AdminBooking>, text: string) {
    try {
      const b = await action();
      setBooking(b);
      setForm({ statusId: b.status?.id ?? 1, isPaid: b.isPaid });
      setMessage({ ok: true, text });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  }

  function onUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(() => api<AdminBooking>(`/admin/bookings/${id}`, { method: "PUT", body: JSON.stringify(form) }), "Cập nhật thành công!");
  }

  if (!booking || !form) return message ? <div className="alert alert-danger">{message.text}</div> : null;
  const b = booking;
  // Nút cập nhật chỉ bật khi có thay đổi (giống bản cũ)
  const changed = form.statusId !== (b.status?.id ?? 1) || form.isPaid !== b.isPaid;

  const row = (label: string, value: ReactNode) => (
    <div className="row mb-3">
      <div className="col-md-3 fw-bold">{label}</div>
      <div className="col-md-9">{value}</div>
    </div>
  );

  return (
    <>
      <PageTitle title="Thông tin đơn đặt phòng" crumbs={[{ label: "Đơn đặt phòng", to: "/admin/bookings" }, { label: `Đơn #${b.id}` }]} />
      <PageCard>
        {message && <div className={`alert ${message.ok ? "alert-success" : "alert-danger"} mt-3`}>{message.text}</div>}

        <div className="row mt-3">
          <div className="col-sm-12 mb-3 room-img-container">{b.room.image && <img src={b.room.image} className="room-img" alt={b.room.hotelName} />}</div>
          <div className="col-md-6 row mb-3">
            <div className="col-sm-12 fw-bold">Tên khách sạn</div>
            <div className="col-sm-12">{b.room.hotelName}</div>
          </div>
          <div className="col-md-6 row mb-3">
            <div className="col-sm-12 fw-bold">Loại phòng</div>
            <div className="col-sm-12">{b.room.type?.name}</div>
          </div>
          <div className="col-sm-12 row mb-3">
            <div className="col-sm-12 fw-bold">Địa chỉ</div>
            <div className="col-sm-12">{b.room.address}</div>
          </div>
          <div className="col-sm-12 mb-3">
            <Link to={`/rooms/${b.room.id}`}>Click để xem chi tiết.</Link>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-12">
            <Link to={`/bookings/${b.id}`}>Xem phiếu xác nhận.</Link>
          </div>
        </div>
        {row("Họ và tên", b.fullname)}
        {row("Email", b.email)}
        {row("Số điện thoại", b.phone)}
        {row("Số phòng", b.numberRoom)}
        {row("Số người trưởng thành", b.numberAdult)}
        {row("Số trẻ nhỏ", b.numberChildren)}
        {row("Ngày tạo", formatDate(b.createdAt))}
        {row("Ngày nhận phòng", formatDate(b.startDate))}
        {row("Ngày trả phòng", formatDate(b.endDate))}
        {row("Lợi nhuận ước tính", `${b.total.toFixed(2)}$`)}
        <div className="row mb-3">
          <div className="col-sm-12 fw-bold">Ghi chú</div>
          <div className="col-sm-12" style={{ whiteSpace: "pre-wrap" }}>
            {b.notes}
          </div>
        </div>

        <form onSubmit={onUpdate}>
          <div className="row mb-3">
            <label className="col-md-3 fw-bold" htmlFor="slcPaid">
              Thanh toán
            </label>
            <div className="col-md-9">
              <select
                className="form-control"
                id="slcPaid"
                value={String(form.isPaid)}
                disabled={b.cancelled}
                onChange={(e) => setForm({ ...form, isPaid: e.target.value === "true" })}
              >
                <option value="false">Chưa thanh toán</option>
                <option value="true">Đã thanh toán</option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-md-3 fw-bold" htmlFor="slcSta">
              Trạng thái
            </label>
            <div className="col-md-9">
              <select
                className="form-control"
                id="slcSta"
                value={form.statusId}
                disabled={b.cancelled}
                onChange={(e) => setForm({ ...form, statusId: Number(e.target.value) })}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-md-3 fw-bold" htmlFor="staff">
              Nhân viên xác nhận
            </label>
            <div className="col-md-9">
              {/* Tự ghi tên nhân viên đang xử lý ở lần cập nhật đầu tiên */}
              <input id="staff" className="form-control" value={b.staffName ?? `${user?.fullname ?? ""} (sẽ được ghi khi cập nhật)`} disabled />
            </div>
          </div>
          <div className="mb-3 d-flex justify-content-center">
            <button type="submit" className="btn btn-primary mx-3" disabled={!changed || b.cancelled}>
              Cập nhật trạng thái
            </button>
            {!b.cancelled && (
              <button type="button" className="btn btn-danger mx-3" onClick={() => setConfirmCancel(true)}>
                Hủy đơn
              </button>
            )}
          </div>
          {b.cancelled && <p className="text-center text-danger">Đơn đặt phòng đã bị hủy.</p>}
        </form>
      </PageCard>

      {confirmCancel && (
        <Modal
          title="Hủy đơn đặt phòng"
          onClose={() => setConfirmCancel(false)}
          footer={
            <button
              className="btn btn-danger"
              onClick={() => {
                setConfirmCancel(false);
                run(() => api<AdminBooking>(`/admin/bookings/${id}/cancel`, { method: "POST" }), "Đã hủy đơn.");
              }}
            >
              Hủy đơn
            </button>
          }
        >
          Bạn chắc chắn muốn hủy đơn #{b.id} của {b.fullname}?
        </Modal>
      )}
    </>
  );
}
