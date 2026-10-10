import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { Permission, useAuth } from "../auth/AuthContext";

function roleName(permission: number) {
  if (permission >= Permission.ADMIN) return "Quản trị cấp cao";
  if (permission >= Permission.STAFF) return "Nhân viên quản lý";
  return "Khách hàng";
}

type Message = { type: "success" | "danger"; text: string } | null;

export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState<Message>(null);
  const [profileMessage, setProfileMessage] = useState<Message>(null);

  async function onUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    try {
      await updateProfile({ fullname: text("fullname"), email: text("email"), phone: text("phone") || undefined });
      setProfileMessage({ type: "success", text: "Cập nhật thông tin thành công" });
    } catch (err) {
      setProfileMessage({ type: "danger", text: (err as Error).message });
    }
  }

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
        <p className="text-muted">
          Tên đăng nhập: <b>{user.username}</b> · Vai trò: <b>{roleName(user.permission)}</b>
        </p>
        {profileMessage && <div className={`alert alert-${profileMessage.type}`}>{profileMessage.text}</div>}
        <form onSubmit={onUpdateProfile}>
          <div className="mb-3">
            <label className="form-label" htmlFor="p-fullname">
              Họ tên
            </label>
            <input id="p-fullname" name="fullname" className="form-control" defaultValue={user.fullname} required maxLength={100} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="p-email">
              Email
            </label>
            <input id="p-email" name="email" type="email" className="form-control" defaultValue={user.email} required maxLength={45} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="p-phone">
              Số điện thoại
            </label>
            <input id="p-phone" name="phone" type="tel" className="form-control" defaultValue={user.phone ?? ""} maxLength={20} />
          </div>
          <button className="btn btn-success">Lưu thông tin</button>
        </form>
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
