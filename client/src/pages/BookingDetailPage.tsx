import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatDate, type Booking } from "../api/client";
import { BookingStatus } from "../components/BookingStatus";

/** Phiếu xác nhận đặt phòng (thay cho views/ticket.php). Dùng chức năng in của trình duyệt để lưu PDF. */
export function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Booking>(`/bookings/${id}`)
      .then(setBooking)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!booking) return <p>Đang tải...</p>;

  const b = booking;
  return (
    <>
      <div className="d-flex gap-2 mb-3 d-print-none">
        <Link to="/bookings" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left" /> Đơn của tôi
        </Link>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <i className="bi bi-printer" /> In / Lưu PDF
        </button>
      </div>

      <div className="card mx-auto" style={{ maxWidth: 900 }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between flex-wrap mb-4">
            <div>
              <h1 className="h4 mb-1">Phiếu xác nhận đặt phòng</h1>
              <div className="text-muted">{b.room.hotelName}</div>
              <div className="small text-muted">{b.room.address}</div>
            </div>
            <div className="text-end">
              <div>
                Mã phiếu: <b>#{b.id}</b>
              </div>
              <div className="small">Ngày đặt: {formatDate(b.createdAt)}</div>
              <div className="mt-1">
                <BookingStatus booking={b} />
              </div>
            </div>
          </div>

          <dl className="row mb-4">
            <dt className="col-sm-3">Khách hàng</dt>
            <dd className="col-sm-9">{b.fullname}</dd>
            <dt className="col-sm-3">Số điện thoại</dt>
            <dd className="col-sm-9">{b.phone}</dd>
            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">{b.email}</dd>
          </dl>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Nhận phòng</th>
                  <th>Trả phòng</th>
                  <th className="text-end">Số đêm</th>
                  <th className="text-end">Số phòng</th>
                  <th className="text-end">Giá / đêm</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {b.room.type?.name}
                    <div className="small text-muted">
                      {b.numberAdult} người lớn, {b.numberChildren} trẻ nhỏ
                    </div>
                  </td>
                  <td>{formatDate(b.startDate)}</td>
                  <td>{formatDate(b.endDate)}</td>
                  <td className="text-end">{b.nights}</td>
                  <td className="text-end">{b.numberRoom}</td>
                  <td className="text-end">${b.room.price}</td>
                  <td className="text-end">${b.total}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={6} className="text-end">
                    Tổng cộng
                  </th>
                  <th className="text-end">${b.total}</th>
                </tr>
              </tfoot>
            </table>
          </div>

          {b.notes && (
            <div className="mb-4">
              <b>Ghi chú:</b>
              {/* Hiển thị dạng văn bản, React tự escape nội dung */}
              <div style={{ whiteSpace: "pre-wrap" }}>{b.notes}</div>
            </div>
          )}

          <div className="row text-center mt-5">
            <div className="col-6">
              <div className="fw-bold">Nhân viên xác nhận</div>
              <div className="mt-4">{b.staffName ?? "—"}</div>
            </div>
            <div className="col-6">
              <div className="fw-bold">Khách hàng</div>
              <div className="mt-4">{b.fullname}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
