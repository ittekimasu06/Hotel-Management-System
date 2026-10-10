import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { Permission, useAuth } from "../auth/AuthContext";

function roleName(permission: number) {
  if (permission >= Permission.ADMIN) return "Quản trị cấp cao";
  if (permission >= Permission.STAFF) return "Nhân viên quản lý";
  return "Khách hàng";
}

type Message = { ok: boolean; text: string } | null;
type Tab = "overview" | "edit" | "password";

function Alert({ message }: { message: Message }) {
  if (!message) return null;
  return <div className={`alert ${message.ok ? "alert-success" : "alert-danger"} py-2`}>{message.text}</div>;
}

/** Thông tin cá nhân, chuyển từ views/profiles.php (ba tab: tổng quan, chỉnh sửa, đổi mật khẩu) */
export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [profileMsg, setProfileMsg] = useState<Message>(null);
  const [passwordMsg, setPasswordMsg] = useState<Message>(null);

  if (!user) return null;

  async function onUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    try {
      await updateProfile({ fullname: text("fullname"), email: text("email"), phone: text("phone") || undefined });
      setProfileMsg({ ok: true, text: "Cập nhật thành công!" });
    } catch (err) {
      setProfileMsg({ ok: false, text: (err as Error).message });
    }
  }

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    try {
      await api("/auth/password", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(formEl))) });
      formEl.reset();
      setPasswordMsg({ ok: true, text: "Đổi mật khẩu thành công!" });
    } catch (err) {
      setPasswordMsg({ ok: false, text: (err as Error).message });
    }
  }

  const tabButton = (id: Tab, label: string) => (
    <li className="nav-item">
      <button type="button" className={`nav-link ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
        {label}
      </button>
    </li>
  );

  const row = (label: string, value: string) => (
    <div className="row mt-3">
      <div className="col-lg-2 col-md-3 fw-bold label">{label}</div>
      <div className="col-lg-10 col-md-9">{value}</div>
    </div>
  );

  return (
    <main className="main">
      <div className="intro-single">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body pt-3">
                  <ul className="nav nav-tabs nav-tabs-bordered">
                    {tabButton("overview", "Tổng quan")}
                    {tabButton("edit", "Chỉnh sửa")}
                    {tabButton("password", "Đổi mật khẩu")}
                  </ul>
                  <div className="tab-content pt-2">
                    {tab === "overview" && (
                      <div className="tab-pane fade show active profile-overview">
                        <h5 className="card-title">Chi tiết</h5>
                        {row("Họ tên", user.fullname)}
                        {row("Tên đăng nhập", user.username)}
                        {row("Số điện thoại", user.phone ?? "")}
                        {row("Email", user.email)}
                        {row("Vị trí", roleName(user.permission))}
                      </div>
                    )}

                    {tab === "edit" && (
                      <div className="tab-pane fade show active profile-edit pt-3">
                        <Alert message={profileMsg} />
                        <form onSubmit={onUpdateProfile}>
                          <div className="row mb-3">
                            <label htmlFor="fullName" className="col-md-3 col-lg-2 col-form-label">
                              Tên đầy đủ
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input name="fullname" type="text" className="form-control" id="fullName" defaultValue={user.fullname} required maxLength={100} />
                            </div>
                          </div>
                          <div className="row mb-3">
                            <label htmlFor="emailInput" className="col-md-3 col-lg-2 col-form-label">
                              Email
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input name="email" type="email" className="form-control" id="emailInput" defaultValue={user.email} required maxLength={45} />
                            </div>
                          </div>
                          <div className="row mb-3">
                            <label htmlFor="Phone" className="col-md-3 col-lg-2 col-form-label">
                              Số điện thoại
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input name="phone" type="tel" className="form-control" id="Phone" defaultValue={user.phone ?? ""} maxLength={20} />
                            </div>
                          </div>
                          <div className="text-center">
                            <button type="submit" className="btn btn-primary">
                              Lưu thay đổi
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {tab === "password" && (
                      <div className="tab-pane fade show active pt-3">
                        <Alert message={passwordMsg} />
                        <form onSubmit={onChangePassword}>
                          <div className="row mb-3">
                            <label htmlFor="currentPassword" className="col-md-3 col-lg-2 col-form-label">
                              Mật khẩu hiện tại
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input name="currentPassword" type="password" className="form-control" id="currentPassword" placeholder="••••••••" autoComplete="current-password" required />
                            </div>
                          </div>
                          <div className="row mb-3">
                            <label htmlFor="newPassword" className="col-md-3 col-lg-2 col-form-label">
                              Mật khẩu mới
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input
                                name="newPassword"
                                type="password"
                                className="form-control"
                                id="newPassword"
                                placeholder="Ít nhất 8 ký tự"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={72}
                              />
                            </div>
                          </div>
                          <div className="row mb-3">
                            <label htmlFor="renewPassword" className="col-md-3 col-lg-2 col-form-label">
                              Nhập lại mật khẩu mới
                            </label>
                            <div className="col-md-9 col-lg-10">
                              <input name="confirmPassword" type="password" className="form-control" id="renewPassword" placeholder="Ít nhất 8 ký tự" autoComplete="new-password" required />
                            </div>
                          </div>
                          <div className="text-center">
                            <button type="submit" className="btn btn-primary">
                              Đổi mật khẩu
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
