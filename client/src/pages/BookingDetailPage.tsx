import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate, type Booking } from "../api/client";
import { useLegacyStyle } from "../legacy/useLegacyStyle";

const TICKET_CSS = `
.ticket-page, .ticket-page * { font-family: "Nunito", sans-serif !important; font-optical-sizing: auto; }
.ticket-page .bi::before { font-family: "bootstrap-icons" !important; }
.ticket-page { min-height: 100vh; margin: 0; padding: 0; background-color: #131417; display: flow-root; }
.ticket-page .ticket { margin: auto; width: 900px; max-width: 100%; }
@media print {
  .ticket-page { background: #fff; }
  .ticket-page .no-print { display: none !important; }
}
`;

/** Ngày dạng dd-mm-yyyy như bản cũ */
const dashDate = (value: string) => formatDate(value).replaceAll("/", "-");

/** Phiếu xác nhận đặt phòng, chuyển từ views/ticket.php (trang riêng, nền tối) */
export function BookingDetailPage() {
  useLegacyStyle("ticket", TICKET_CSS);
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Booking>(`/bookings/${id}`)
      .then(setBooking)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const fileName = `Phieu_xac_nhan_dat_phong_${id}`;

  async function capture() {
    // Chỉ tải thư viện khi người dùng bấm nút để giữ bundle chính nhỏ
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(ticketRef.current!, { scale: 2, backgroundColor: "#ffffff" });
  }

  async function downloadImage() {
    setBusy(true);
    try {
      const canvas = await capture();
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${fileName}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  async function exportPdf() {
    setBusy(true);
    try {
      const [canvas, { jsPDF }] = await Promise.all([capture(), import("jspdf")]);
      const pdf = new jsPDF({ unit: "in", format: "a4", orientation: "portrait" });
      const margin = 0.5;
      const width = pdf.internal.pageSize.getWidth() - margin * 2;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", margin, margin, width, height);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="ticket-page d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <p>{error}</p>
          <Link to="/bookings" className="btn btn-primary">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }
  if (!booking) return <div className="ticket-page" />;
  const b = booking;

  return (
    <div className="ticket-page">
      <div className="container">
        <div className="row text-white my-3">
          <h1 className="text-center">ĐƠN ĐĂNG KÝ ĐẶT PHÒNG</h1>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3 my-3 no-print">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <i className="bi bi-reply" /> Quay lại
          </button>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house" /> Trang chủ
          </Link>
          <button className="btn btn-primary" onClick={downloadImage} disabled={busy}>
            <i className="bi bi-download" /> Tải ảnh xuống
          </button>
          <button className="btn btn-primary" onClick={exportPdf} disabled={busy}>
            <i className="bi bi-filetype-pdf" /> Xuất PDF
          </button>
        </div>

        <div className="row mb-5">
          <div className="ticket bg-white p-5" ref={ticketRef}>
            <div className="row d-flex justify-content-between">
              <div className="col-6">
                <span className="me-2">
                  <b>Khách sạn:</b>
                </span>
                {b.room.hotelName}
              </div>
              <div className="col-3 d-flex justify-content-center">
                <span className="me-2">
                  <b>Mã phiếu:</b>
                </span>
                {b.id}
              </div>
            </div>
            <div className="row p-4 mb-4">
              <h2 className="text-center">PHIẾU XÁC NHẬN ĐẶT PHÒNG</h2>
            </div>
            {[
              ["Tên khách hàng:", b.fullname],
              ["Số điện thoại:", b.phone],
              ["Email:", b.email],
              ["Ngày tạo:", dashDate(b.createdAt)],
            ].map(([label, value]) => (
              <div className="row" key={label}>
                <div className="col-3">
                  <b>{label}</b>
                </div>
                <div className="col-9">{value}</div>
              </div>
            ))}
            <div className="row mt-3">
              <div className="col-3 fw-bold">Chi tiết</div>
              <div className="col-12">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Số lượng phòng</th>
                      <th>Người lớn</th>
                      <th>Trẻ nhỏ</th>
                      <th>Ngày nhận</th>
                      <th>Ngày trả</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{b.id}</td>
                      <td className="text-end">{b.numberRoom}</td>
                      <td className="text-end">{b.numberAdult}</td>
                      <td className="text-end">{b.numberChildren}</td>
                      <td>{dashDate(b.startDate)}</td>
                      <td>{dashDate(b.endDate)}</td>
                      <td className="text-end">{b.room.price.toFixed(2)}$</td>
                      <td className="text-end">{b.total.toFixed(2)}$</td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="text-end">
                        <b>Tổng:</b>
                      </td>
                      <td className="text-end">
                        <b>{b.total.toFixed(2)}$</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 fw-bold">Ghi chú:</div>
              <div className="col-12" style={{ whiteSpace: "pre-wrap" }}>
                {b.notes}
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-3">
                <b>Thanh toán:</b>
              </div>
              <div className="col-9">
                {b.cancelled ? <span className="text-danger">Đơn đã bị hủy</span> : b.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
              </div>
            </div>
            <div className="row my-5 d-flex justify-content-between">
              <div className="col-5">
                <div className="d-flex justify-content-center mb-2">
                  <b>Nhân viên xác nhận</b>
                </div>
                <div className="d-flex justify-content-center">{b.staffName}</div>
              </div>
              <div className="col-5">
                <div className="d-flex justify-content-center mb-2">
                  <b>Khách hàng</b>
                </div>
                <div className="d-flex justify-content-center">{b.fullname}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
