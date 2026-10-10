import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, type Booking } from "../api/client";

/** Lịch sử đặt phòng, chuyển từ views/histories.php */
export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<Booking | null>(null);

  useEffect(() => {
    api<Booking[]>("/bookings")
      .then(setBookings)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function cancel(booking: Booking) {
    try {
      const updated = await api<Booking>(`/bookings/${booking.id}/cancel`, { method: "POST" });
      setBookings((list) => list?.map((b) => (b.id === updated.id ? updated : b)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  const detail = (label: string, value: ReactNode) => (
    <div className="row mb-2">
      <div className="col-md-3 fw-bold">{label}</div>
      <div className="col-md-9">{value}</div>
    </div>
  );

  return (
    <main className="main">
      <div className="intro-single">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {bookings?.length === 0 && <div className="row">Không tìm thấy dữ liệu đặt phòng!</div>}
          {bookings?.map((b) => (
            <div key={b.id}>
              <div
                className={`history-row d-flex justify-content-between align-items-center shadow p-3 mb-3 rounded border border-5 border-top-0 border-bottom-0 ${
                  b.cancelled ? "border-danger" : "border-success"
                }`}
              >
                <div className="history-infor d-flex align-items-center">
                  <a
                    href="#"
                    role="button"
                    aria-expanded={expanded === b.id}
                    onClick={(e) => {
                      e.preventDefault();
                      setExpanded(expanded === b.id ? null : b.id);
                    }}
                  >
                    <i className={`bi ${expanded === b.id ? "bi-chevron-up" : "bi-chevron-down"} me-1`} />
                    <span>
                      Đơn đặt phòng ngày {formatDate(b.createdAt)} · {b.room.hotelName}
                    </span>
                    {b.cancelled && <span className="ms-1 text-danger">(Đã bị hủy)</span>}
                  </a>
                </div>
                <div className="history-dropdown dropdown">
                  <a className="icon" href="#" data-bs-toggle="dropdown" aria-label="Thao tác" onClick={(e) => e.preventDefault()}>
                    <i className="bi bi-three-dots-vertical" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li>
                      <Link className="dropdown-item py-0" to={`/bookings/${b.id}`}>
                        Xem hóa đơn
                      </Link>
                    </li>
                    {b.canCancel && (
                      <>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button className="dropdown-item py-0 text-danger" onClick={() => setConfirming(b)}>
                            Hủy đơn
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              {expanded === b.id && (
                <div className="row py-2">
                  <div className="col-12">
                    <div className="card card-body mb-3">
                      {detail("Họ tên:", b.fullname)}
                      {detail("Số điện thoại:", b.phone)}
                      {detail("Email:", b.email)}
                      {detail("Ngày nhận phòng:", formatDate(b.startDate))}
                      {detail("Ngày trả phòng:", formatDate(b.endDate))}
                      {detail("Trạng thái:", b.status?.name)}
                      {detail("Thanh toán:", b.isPaid ? "Đã thanh toán" : "Chưa thanh toán")}
                      {detail(
                        "Hiệu lực:",
                        b.cancelled ? (
                          <>
                            <span className="text-danger me-1">Không</span>
                            <span>(Đơn đặt phòng đã bị hủy)</span>
                          </>
                        ) : (
                          <span className="text-success">Có</span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {confirming && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="cancel-title">
                    Hủy đơn đặt phòng
                  </h1>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={() => setConfirming(null)} />
                </div>
                <div className="modal-body">
                  <p>Đơn ngày {formatDate(confirming.createdAt)}</p>
                  <p>Bạn chắc chắn muốn hủy đơn này?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setConfirming(null)}>
                    Thoát
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => cancel(confirming)}>
                    Hủy đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </main>
  );
}
