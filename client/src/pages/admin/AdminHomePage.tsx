import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { money, type Dashboard, type Trend } from "./adminApi";
import { RevenueChart } from "./RevenueChart";
import { PageTitle } from "./ui";

/** Thẻ thống kê kiểu NiceAdmin (info-card) */
function InfoCard({ kind, title, period, icon, value, trend }: { kind: string; title: string; period: string; icon: string; value: string; trend: Trend }) {
  let change = <span className="text-muted small pt-2 ps-1">Chưa có dữ liệu kỳ trước</span>;
  if (trend.change !== null) {
    const up = trend.change >= 0;
    change = (
      <>
        <span className="text-muted small pt-2 ps-1">{up ? "Tăng" : "Giảm"}</span>{" "}
        <span className={`text-${up ? "success" : "danger"} small pt-1 fw-bold`}>{Math.abs(trend.change).toFixed(2)}%</span>
      </>
    );
  }
  return (
    <div className="col-md-4">
      <div className={`card info-card ${kind}`}>
        <div className="card-body">
          <h5 className="card-title">
            {title} <span>| {period}</span>
          </h5>
          <div className="d-flex align-items-center">
            <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
              <i className={`bi ${icon}`} />
            </div>
            <div className="ps-3">
              <h6>{value}</h6>
              {change}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dashboard, chuyển từ admin/index.php */
export function AdminHomePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/admin/dashboard")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle title="Dashboard" crumbs={[{ label: "Thống kê" }]} />
      {error && <div className="alert alert-danger">{error}</div>}
      {data && (
        <section className="section dashboard">
          <div className="row">
            <div className="col-lg-12">
              <div className="row">
                <InfoCard kind="customers-card" title="Người dùng" period="Trong năm" icon="bi-people" value={String(data.users.current)} trend={data.users} />
                <InfoCard kind="sales-card" title="Đơn đặt phòng" period="Trong tháng" icon="bi-receipt-cutoff" value={String(data.bookings.current)} trend={data.bookings} />
                <InfoCard kind="revenue-card" title="Lợi nhuận" period="Trong tháng" icon="bi-currency-dollar" value={money(data.revenue.current)} trend={data.revenue} />
              </div>
            </div>
            <div className="col-12">
              <RevenueChart year={data.year} values={data.revenueByMonth} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
