import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { Permission, useAuth } from "../auth/AuthContext";

function roleName(permission: number) {
  if (permission >= Permission.ADMIN) return "Quản trị cấp cao";
  if (permission >= Permission.STAFF) return "Nhân viên quản lý";
  return "Khách hàng";
}

export function AccountPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      await api("/auth/password", {
        method: "PUT",
        body: JSON.stringify(Object.fromEntries(form)),
      });
      formEl.reset();
      setMessage({ type: "success", text: "Đổi mật khẩu thành công" });
    } catch (err) {
      setMessage({ type: "danger", text: (err as Error).message });
    }
  }

  if (!user) return null;

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <h1 className="h4 mb-3">Tài khoản</h1>
        <dl className="row">
          <dt className="col-sm-4">Họ tên</dt>
          <dd className="col-sm-8">{user.fullname}</dd>
          <dt className="col-sm-4">Tên đăng nhập</dt>
          <dd className="col-sm-8">{user.username}</dd>
          <dt className="col-sm-4">Email</dt>
          <dd className="col-sm-8">{user.email}</dd>
          <dt className="col-sm-4">Số điện thoại</dt>
          <dd className="col-sm-8">{user.phone || "—"}</dd>
          <dt className="col-sm-4">Vai trò</dt>
          <dd className="col-sm-8">{roleName(user.permission)}</dd>
        </dl>
      </div>
      <div className="col-lg-6">
        <h2 className="h5 mb-3">Đổi mật khẩu</h2>
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={onChangePassword}>
          <div className="mb-3">
            <label className="form-label" htmlFor="currentPassword">
              Mật khẩu hiện tại
            </label>
            <input id="currentPassword" name="currentPassword" type="password" className="form-control" autoComplete="current-password" required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="newPassword">
              Mật khẩu mới
            </label>
            <input id="newPassword" name="newPassword" type="password" className="form-control" autoComplete="new-password" required minLength={8} maxLength={72} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="confirmPassword">
              Nhập lại mật khẩu mới
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" autoComplete="new-password" required />
          </div>
          <button className="btn btn-success">Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  );
}
