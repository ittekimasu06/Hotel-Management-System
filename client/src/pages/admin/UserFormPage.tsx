import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, formatDate } from "../../api/client";
import { Permission, useAuth } from "../../auth/AuthContext";
import { roleName, type AdminUser } from "./adminApi";
import { PageCard, PageTitle } from "./ui";

const ROLES = [Permission.CUSTOMER, Permission.STAFF, Permission.ADMIN];

/** Thêm người dùng (admin/adduser.php) */
function AddUser() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const grantable = ROLES.filter((r) => me && r <= me.permission);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    try {
      await api("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullname: text("fullname"),
          username: text("username"),
          email: text("email"),
          phone: text("phone") || undefined,
          password: String(form.get("password") ?? ""),
          confirmPassword: String(form.get("confirmPassword") ?? ""),
          permission: Number(form.get("permission") ?? 0),
        }),
      });
      navigate("/admin/users");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const field = (id: string, label: string, input: ReactNode) => (
    <div className="mb-3 mt-3 row">
      <label htmlFor={id} className="col-sm-3 col-form-label fw-bold">
        {label}
      </label>
      <div className="col-sm-9">{input}</div>
    </div>
  );

  return (
    <>
      <PageTitle title="Thêm mới người sử dụng" crumbs={[{ label: "Người sử dụng" }]} />
      <PageCard>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <form onSubmit={onSubmit}>
          {field("fullname", "Tên đầy đủ", <input id="fullname" name="fullname" className="form-control" placeholder="Fullname" required maxLength={100} />)}
          {field(
            "username",
            "Tên đăng nhập",
            <input id="username" name="username" className="form-control" placeholder="Username" required minLength={3} maxLength={45} pattern="[a-zA-Z0-9_.]+" autoComplete="off" />,
          )}
          {field("email", "Email", <input id="email" name="email" type="email" className="form-control" placeholder="Email" required maxLength={45} />)}
          {field("phone", "Số điện thoại", <input id="phone" name="phone" type="tel" className="form-control" placeholder="Phone" maxLength={20} />)}
          {field(
            "password",
            "Mật khẩu",
            <input id="password" name="password" type="password" className="form-control" placeholder="Password" required minLength={8} maxLength={72} autoComplete="new-password" />,
          )}
          {field(
            "confirmPassword",
            "Nhập lại mật khẩu",
            <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" placeholder="Confirm password" required autoComplete="new-password" />,
          )}
          {field(
            "permission",
            "Vị trí",
            <select id="permission" name="permission" className="form-select" defaultValue={0}>
              {grantable.map((r) => (
                <option key={r} value={r}>
                  {roleName(r)}
                </option>
              ))}
            </select>,
          )}
          <div className="text-center mb-3">
            <button type="submit" className="btn btn-primary">
              Thêm mới
            </button>
          </div>
        </form>
      </PageCard>
    </>
  );
}

/** Xem và sửa người dùng (admin/user.php): thẻ hồ sơ bên trái, tab bên phải */
function EditUser({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [params] = useSearchParams();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<"overview" | "edit">(params.get("tab") === "edit" ? "edit" : "overview");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api<AdminUser>(`/admin/users/${id}`)
      .then(setTarget)
      .catch((e: Error) => setMessage({ ok: false, text: e.message }));
  }, [id]);

  if (!target) return message ? <div className="alert alert-danger">{message.text}</div> : null;

  const canEdit = !!me && target.permission <= me.permission;
  const isSelf = target.id === me?.id;
  const grantable = ROLES.filter((r) => me && r <= me.permission);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();
    try {
      const updated = await api<AdminUser>(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullname: text("fullname"),
          email: text("email"),
          phone: text("phone") || undefined,
          permission: Number(form.get("permission") ?? target!.permission),
        }),
      });
      setTarget(updated);
      setMessage({ ok: true, text: "Cập nhật thành công!" });
      setTab("overview");
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  }

  const row = (label: string, value: string) => (
    <div className="row">
      <div className="col-lg-3 col-md-4 label">{label}</div>
      <div className="col-lg-9 col-md-8">{value}</div>
    </div>
  );

  return (
    <>
      <PageTitle title="Thông tin người sử dụng" crumbs={[{ label: "Người sử dụng", to: "/admin/users" }, { label: "Thông tin" }]} />
      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            <div className="card">
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                <img src="/img/user-profile.jpg" alt="Profile" className="rounded-circle" />
                <h2>{target.fullname}</h2>
                <h3>{target.username}</h3>
                <div className="social-links mt-2">
                  {["twitter", "facebook", "instagram", "linkedin"].map((s) => (
                    <a href="#" className={s} key={s} aria-label={s} onClick={(e) => e.preventDefault()}>
                      <i className={`bi bi-${s}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            <div className="card">
              <div className="card-body pt-3">
                <ul className="nav nav-tabs nav-tabs-bordered">
                  <li className="nav-item">
                    <button className={`nav-link ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
                      Tổng quan
                    </button>
                  </li>
                  {canEdit && (
                    <li className="nav-item">
                      <button className={`nav-link ${tab === "edit" ? "active" : ""}`} onClick={() => setTab("edit")}>
                        Chỉnh sửa
                      </button>
                    </li>
                  )}
                </ul>
                <div className="tab-content pt-2">
                  {message && <div className={`alert ${message.ok ? "alert-success" : "alert-danger"} mt-2 py-2`}>{message.text}</div>}
                  {tab === "overview" && (
                    <div className="tab-pane fade show active profile-overview">
                      <h5 className="card-title">Chi tiết</h5>
                      {row("Tên đầy đủ", target.fullname)}
                      {row("Tên đăng nhập", target.username)}
                      {row("Email", target.email)}
                      {row("Số điện thoại", target.phone ?? "")}
                      {row("Vị trí", roleName(target.permission))}
                      {row("Ngày tạo", target.createdAt ? formatDate(target.createdAt).replaceAll("/", "-") : "")}
                    </div>
                  )}
                  {tab === "edit" && canEdit && (
                    <div className="tab-pane fade show active profile-edit pt-3">
                      <form onSubmit={onSubmit}>
                        <div className="row mb-3">
                          <label htmlFor="fullName" className="col-md-4 col-lg-3 col-form-label">
                            Tên đầy đủ
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input name="fullname" className="form-control" id="fullName" defaultValue={target.fullname} required maxLength={100} />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="email" className="col-md-4 col-lg-3 col-form-label">
                            Email
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input name="email" type="email" className="form-control" id="email" defaultValue={target.email} required maxLength={45} />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="Phone" className="col-md-4 col-lg-3 col-form-label">
                            Số điện thoại
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input name="phone" type="tel" className="form-control" id="Phone" defaultValue={target.phone ?? ""} maxLength={20} />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="permission" className="col-md-4 col-lg-3 col-form-label">
                            Vị trí
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <select id="permission" name="permission" className="form-select" defaultValue={target.permission} disabled={isSelf}>
                              {grantable.map((r) => (
                                <option key={r} value={r}>
                                  {roleName(r)}
                                </option>
                              ))}
                            </select>
                            {isSelf && <div className="form-text">Bạn không thể tự đổi vai trò của chính mình.</div>}
                          </div>
                        </div>
                        <div className="text-center">
                          <button type="submit" className="btn btn-primary me-2">
                            Lưu thay đổi
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/users")}>
                            Quay lại
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
      </section>
    </>
  );
}

/** /admin/users/new: thêm mới; /admin/users/:id: xem và sửa */
export function UserFormPage() {
  const { id } = useParams();
  return id === "new" ? <AddUser /> : <EditUser id={id!} key={id} />;
}
