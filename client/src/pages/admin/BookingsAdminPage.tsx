import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { Pagination } from "../../components/Pagination";
import type { AdminBooking, CatalogItem } from "./adminApi";
import { useAdminList } from "./useAdminList";
import { actionButtons, Modal, PageCard, PageTitle } from "./ui";

/** Danh sách đơn đặt phòng, chuyển từ admin/bills.php (thêm bộ lọc) */
export function BookingsAdminPage() {
  const { data, error, setError, reload, params, setFilter, setPage } = useAdminList<AdminBooking>("/admin/bookings");
  const [statuses, setStatuses] = useState<CatalogItem[]>([]);
  const [deleting, setDeleting] = useState<AdminBooking | null>(null);

  useEffect(() => {
    api<CatalogItem[]>("/admin/bill-statuses").then(setStatuses).catch(() => setStatuses([]));
  }, []);

  async function remove(b: AdminBooking) {
    try {
      await api(`/admin/bookings/${b.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageTitle title="Danh sách" crumbs={[{ label: "Đơn đặt phòng" }]} />
      <PageCard>
        <div className="row my-3 g-2 align-items-center">
          <div className="col-md-3">
            <a href="/api/admin/exports/bookings.xlsx" className="btn btn-success" download>
              <i className="bi bi-filetype-xlsx" /> Xuất Excel
            </a>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" aria-label="Lọc trạng thái" value={params.get("statusId") ?? ""} onChange={(e) => setFilter("statusId", e.target.value)}>
              <option value="">Mọi trạng thái</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" aria-label="Lọc thanh toán" value={params.get("paid") ?? ""} onChange={(e) => setFilter("paid", e.target.value)}>
              <option value="">Thanh toán: tất cả</option>
              <option value="true">Đã thanh toán</option>
              <option value="false">Chưa thanh toán</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" aria-label="Lọc hiệu lực" value={params.get("cancelled") ?? ""} onChange={(e) => setFilter("cancelled", e.target.value)}>
              <option value="">Hiệu lực: tất cả</option>
              <option value="false">Có</option>
              <option value="true">Không (đã hủy)</option>
            </select>
          </div>
        </div>
        {params.get("key") && <p className="small text-muted">Kết quả tìm kiếm cho “{params.get("key")}”</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {data && (
          <>
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Họ tên</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col">Thanh toán</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Hiệu lực</th>
                  <th scope="col" colSpan={3}>
                    Thực hiện
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b.id}>
                    <th scope="row" className="align-middle">
                      {b.id}
                    </th>
                    <td className="align-middle">{b.fullname}</td>
                    <td className="align-middle">{formatDate(b.createdAt)}</td>
                    <td className="align-middle">{b.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</td>
                    <td className="align-middle">{b.status?.name}</td>
                    <td className="align-middle">{b.cancelled ? "Không" : "Có"}</td>
                    <td className="align-middle">
                      <Link className={actionButtons.view} to={`/admin/bookings/${b.id}`} aria-label="Xem">
                        <i className="bi bi-eye" />
                      </Link>
                    </td>
                    <td className="align-middle">
                      <Link className={actionButtons.edit} to={`/admin/bookings/${b.id}`} aria-label="Xử lý">
                        <i className="bi bi-pencil-square" />
                      </Link>
                    </td>
                    <td className="align-middle">
                      <button className={actionButtons.remove} onClick={() => setDeleting(b)} aria-label="Xóa">
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>Không có dữ liệu!</p>}
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </>
        )}
      </PageCard>

      {deleting && (
        <Modal
          title="Xóa đơn đặt phòng"
          onClose={() => setDeleting(null)}
          footer={
            <button className="btn btn-danger" onClick={() => remove(deleting)}>
              Xóa
            </button>
          }
        >
          <p>Bạn có chắc chắn muốn xóa đơn này:</p>
          <p>
            <b>Khách hàng: </b>
            {deleting.fullname}
          </p>
          <p>
            <b>Ngày tạo: </b>
            {formatDate(deleting.createdAt)}
          </p>
          <p>
            <b>Trạng thái: </b>
            {deleting.status?.name}
          </p>
        </Modal>
      )}
    </>
  );
}
