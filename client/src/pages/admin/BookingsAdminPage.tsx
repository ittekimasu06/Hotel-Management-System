import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { BookingStatus } from "../../components/BookingStatus";
import { Pagination } from "../../components/Pagination";
import { money, type AdminBooking, type CatalogItem } from "./adminApi";
import { useAdminList } from "./useAdminList";

export function BookingsAdminPage() {
  const { data, error, params, setFilter, setPage } = useAdminList<AdminBooking>("/admin/bookings");
  const [statuses, setStatuses] = useState<CatalogItem[]>([]);

  useEffect(() => {
    api<CatalogItem[]>("/admin/bill-statuses").then(setStatuses).catch(() => setStatuses([]));
  }, []);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Đơn đặt phòng</h1>
        <a href="/api/admin/exports/bookings.xlsx" className="btn btn-outline-success btn-sm" download>
          <i className="bi bi-file-earmark-excel me-1" />
          Xuất Excel
        </a>
      </div>

      <div className="row g-2 mb-3">
        <form
          className="col-md-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("key", String(new FormData(e.currentTarget).get("key") ?? "").trim());
          }}
        >
          <input name="key" className="form-control form-control-sm" placeholder="Mã đơn, tên, email, SĐT" defaultValue={params.get("key") ?? ""} />
        </form>
        <div className="col-md-3">
          <select className="form-select form-select-sm" value={params.get("statusId") ?? ""} onChange={(e) => setFilter("statusId", e.target.value)}>
            <option value="">Mọi trạng thái</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select form-select-sm" value={params.get("paid") ?? ""} onChange={(e) => setFilter("paid", e.target.value)}>
            <option value="">Thanh toán: tất cả</option>
            <option value="true">Đã thanh toán</option>
            <option value="false">Chưa thanh toán</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select form-select-sm" value={params.get("cancelled") ?? ""} onChange={(e) => setFilter("cancelled", e.target.value)}>
            <option value="">Hiệu lực: tất cả</option>
            <option value="false">Còn hiệu lực</option>
            <option value="true">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p>Đang tải...</p>}
      {data && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Khách sạn</th>
                <th>Lưu trú</th>
                <th className="text-end">Thành tiền</th>
                <th>Tình trạng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((b) => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    {b.fullname}
                    <div className="small text-muted">{b.phone}</div>
                  </td>
                  <td className="small">{b.room.hotelName}</td>
                  <td className="small text-nowrap">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </td>
                  <td className="text-end">{money(b.total)}</td>
                  <td>
                    <BookingStatus booking={b} />
                  </td>
                  <td className="text-end">
                    <Link to={`/admin/bookings/${b.id}`} className="btn btn-outline-primary btn-sm">
                      Xử lý
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="text-muted">Không có đơn nào.</p>}
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
        </div>
      )}
    </>
  );
}
