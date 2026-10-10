import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { Permission, useAuth } from "../../auth/AuthContext";
import { roleName, type AdminUser } from "./adminApi";

const ROLES = [Permission.CUSTOMER, Permission.STAFF, Permission.ADMIN];

/** Trang thêm người dùng (/admin/users/new) và sửa người dùng (/admin/users/:id) */
export function UserFormPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      api<AdminUser>(`/admin/users/${id}`)
        .then(setTarget)
        .catch((e: Error) => setError(e.message));
    }
  }, [id, isNew]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    const body: Record<string, unknown> = {
      fullname: text("fullname"),
      email: text("email"),
      phone: text("phone") || undefined,
      permission: Number(form.get("permission") ?? target?.permission ?? 0),
    };
    if (isNew) {
      body.username = text("username");
      body.password = String(form.get("password") ?? "");
      body.confirmPassword = String(form.get("confirmPassword") ?? "");
    }
    try {
      await api(isNew ? "/admin/users" : `/admin/users/${id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      navigate("/admin/users");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!isNew && !target && !error) return <p>Đang tải...</p>;
  // Chỉ được gán quyền không cao hơn quyền của mình; không tự đổi quyền của chính mình
  const grantable = ROLES.filter((r) => me && r <= me.permission);
  const isSelf = target?.id === me?.id;

  return (
    <>
      <Link to="/admin/users" className="small">
        <i className="bi bi-arrow-left" /> Danh sách người dùng
      </Link>
      <h1 className="h4 my-3">{isNew ? "Thêm người dùng" : `Sửa người dùng ${target?.username ?? ""}`}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="row g-3" style={{ maxWidth: 720 }}>
        {isNew && (
          <>
            <div className="col-md-6">
              <label className="form-label" htmlFor="u-username">
                Tên đăng nhập
              </label>
              <input id="u-username" name="username" className="form-control" required minLength={3} maxLength={45} pattern="[a-zA-Z0-9_.]+" autoComplete="off" />
            </div>
            <div className="col-md-6" />
            <div className="col-md-6">
              <label className="form-label" htmlFor="u-password">
                Mật khẩu
              </label>
              <input id="u-password" name="password" type="password" className="form-control" required minLength={8} maxLength={72} autoComplete="new-password" />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="u-confirm">
                Nhập lại mật khẩu
              </label>
              <input id="u-confirm" name="confirmPassword" type="password" className="form-control" required autoComplete="new-password" />
            </div>
          </>
        )}
        <div className="col-md-6">
          <label className="form-label" htmlFor="u-fullname">
            Họ tên
          </label>
          <input id="u-fullname" name="fullname" className="form-control" defaultValue={target?.fullname} required maxLength={100} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="u-email">
            Email
          </label>
          <input id="u-email" name="email" type="email" className="form-control" defaultValue={target?.email} required maxLength={45} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="u-phone">
            Số điện thoại
          </label>
          <input id="u-phone" name="phone" type="tel" className="form-control" defaultValue={target?.phone ?? ""} maxLength={20} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="u-permission">
            Vai trò
          </label>
          <select id="u-permission" name="permission" className="form-select" defaultValue={target?.permission ?? 0} disabled={isSelf}>
            {grantable.map((r) => (
              <option key={r} value={r}>
                {roleName(r)}
              </option>
            ))}
          </select>
          {isSelf && <div className="form-text">Bạn không thể tự đổi vai trò của chính mình.</div>}
        </div>
        <div className="col-12">
          <button className="btn btn-success">{isNew ? "Tạo tài khoản" : "Lưu thay đổi"}</button>
        </div>
      </form>
    </>
  );
}
