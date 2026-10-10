import { Link } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Pagination } from "../../components/Pagination";
import { roleName, type AdminUser } from "./adminApi";
import { useAdminList } from "./useAdminList";

export function UsersAdminPage() {
  const { user: me } = useAuth();
  const { data, error, setError, reload, params, setFilter, setPage } = useAdminList<AdminUser>("/admin/users");

  async function remove(u: AdminUser) {
    if (!window.confirm(`Xóa tài khoản ${u.username}?`)) return;
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Giống quy tắc phía server: chỉ quản lý người có quyền thấp hơn hoặc bằng mình
  const canManage = (u: AdminUser) => !!me && u.permission <= me.permission;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Người dùng</h1>
        <div className="d-flex gap-2">
          <a href="/api/admin/exports/users.xlsx" className="btn btn-outline-success btn-sm" download>
            <i className="bi bi-file-earmark-excel me-1" />
            Xuất Excel
          </a>
          <Link to="/admin/users/new" className="btn btn-success btn-sm">
            <i className="bi bi-plus-lg me-1" />
            Thêm người dùng
          </Link>
        </div>
      </div>

      <form
        className="mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter("key", String(new FormData(e.currentTarget).get("key") ?? "").trim());
        }}
      >
        <input name="key" className="form-control form-control-sm" placeholder="Tìm theo tên đăng nhập, họ tên, email" defaultValue={params.get("key") ?? ""} />
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p>Đang tải...</p>}
      {data && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.fullname}</td>
                  <td className="small">
                    {u.email}
                    {u.phone && <div className="text-muted">{u.phone}</div>}
                  </td>
                  <td>
                    <span className={`badge ${u.permission >= 1 ? "text-bg-primary" : "text-bg-light"}`}>{roleName(u.permission)}</span>
                  </td>
                  <td className="small">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                  <td className="text-end text-nowrap">
                    {canManage(u) && (
                      <Link to={`/admin/users/${u.id}`} className="btn btn-outline-primary btn-sm me-1">
                        Sửa
                      </Link>
                    )}
                    {canManage(u) && u.id !== me?.id && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(u)}>
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="text-muted">Không có người dùng nào.</p>}
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
        </div>
      )}
    </>
  );
}
