import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { money, type Dashboard, type Trend } from "./adminApi";
import { RevenueChart } from "./RevenueChart";

function TrendLine({ trend, period }: { trend: Trend; period: string }) {
  if (trend.change === null) {
    return <span className="small text-muted">Không có dữ liệu {period} để so sánh</span>;
  }
  const up = trend.change >= 0;
  return (
    <span className="small text-muted">
      <i className={`bi ${up ? "bi-arrow-up-right" : "bi-arrow-down-right"} me-1`} aria-hidden />
      {up ? "Tăng" : "Giảm"} {Math.abs(trend.change).toFixed(1)}% so với {period}
    </span>
  );
}

function StatTile({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="small text-muted">{label}</div>
        <div className="fs-3 fw-semibold">{value}</div>
        {children}
      </div>
    </div>
  );
}

export function AdminHomePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/admin/dashboard")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p>Đang tải...</p>;

  return (
    <>
      <h1 className="h4 mb-3">Tổng quan</h1>
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-4">
          <StatTile label="Doanh thu tháng này" value={money(data.revenue.current)}>
            <TrendLine trend={data.revenue} period="tháng trước" />
          </StatTile>
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatTile label="Đơn đặt phòng tháng này" value={String(data.bookings.current)}>
            <TrendLine trend={data.bookings} period="tháng trước" />
          </StatTile>
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatTile label={`Người dùng mới năm ${data.year}`} value={String(data.users.current)}>
            <TrendLine trend={data.users} period="năm trước" />
          </StatTile>
        </div>
        <div className="col-sm-6 col-xl-6">
          <StatTile label="Đơn chờ xử lý" value={String(data.pendingBookings)}>
            <Link to="/admin/bookings?statusId=1&cancelled=false" className="small">
              Xem danh sách
            </Link>
          </StatTile>
        </div>
        <div className="col-sm-6 col-xl-6">
          <StatTile label="Liên hệ chưa xem" value={String(data.unseenContacts)}>
            <Link to="/admin/contacts?seen=false" className="small">
              Xem danh sách
            </Link>
          </StatTile>
        </div>
      </div>
      <RevenueChart year={data.year} values={data.revenueByMonth} />
    </>
  );
}
