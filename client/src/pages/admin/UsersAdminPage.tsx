import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Pagination } from "../../components/Pagination";
import type { AdminUser } from "./adminApi";
import { useAdminList } from "./useAdminList";
import { actionButtons, Modal, PageCard, PageTitle } from "./ui";

/** Danh sách người dùng, chuyển từ admin/users.php */
export function UsersAdminPage() {
  const { user: me } = useAuth();
  const { data, error, setError, reload, params, setPage } = useAdminList<AdminUser>("/admin/users");
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  async function remove(u: AdminUser) {
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  // Giống quy tắc phía server: chỉ quản lý người có quyền thấp hơn hoặc bằng mình
  const canManage = (u: AdminUser) => !!me && u.permission <= me.permission;

  return (
    <>
      <PageTitle title="Danh sách" crumbs={[{ label: "Người sử dụng" }]} />
      <PageCard>
        <div className="row my-3">
          <div className="col-md-12">
            <a href="/api/admin/exports/users.xlsx" className="btn btn-success me-3" download>
              <i className="bi bi-filetype-xlsx" /> Xuất Excel
            </a>
            <Link to="/admin/users/new" className="btn btn-primary">
              <i className="bi bi-person-add" /> Thêm người dùng
            </Link>
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
                  <th scope="col">Tên đăng nhập</th>
                  <th scope="col">Tên đầy đủ</th>
                  <th scope="col">Hộp thư</th>
                  <th scope="col">Điện thoại</th>
                  <th scope="col" colSpan={3}>
                    Thực hiện
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <th scope="row" className="align-middle">
                      {u.id}
                    </th>
                    <td className="align-middle">{u.username}</td>
                    <td className="align-middle">{u.fullname}</td>
                    <td className="align-middle">{u.email}</td>
                    <td className="align-middle">{u.phone}</td>
                    <td className="align-middle">
                      <Link className={actionButtons.view} to={`/admin/users/${u.id}`} aria-label="Xem">
                        <i className="bi bi-eye" />
                      </Link>
                    </td>
                    <td className="align-middle">
                      <Link className={`${actionButtons.edit} ${canManage(u) ? "" : "disabled"}`} to={`/admin/users/${u.id}?tab=edit`} aria-label="Sửa">
                        <i className="bi bi-pencil-square" />
                      </Link>
                    </td>
                    <td className="align-middle">
                      <button className={actionButtons.remove} disabled={!canManage(u) || u.id === me?.id} onClick={() => setDeleting(u)} aria-label="Xóa">
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
          title="Xóa tài khoản"
          onClose={() => setDeleting(null)}
          footer={
            <button className="btn btn-danger" onClick={() => remove(deleting)}>
              Xóa
            </button>
          }
        >
          Bạn có chắc chắn muốn xóa tài khoản: {deleting.username}
        </Modal>
      )}
    </>
  );
}
