import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLegacyStyle } from "../legacy/useLegacyStyle";
import authCss from "../legacy/auth.css?inline";

/** Trang đăng ký, chuyển từ views/register.php */
export function RegisterPage() {
  useLegacyStyle("auth", authCss);
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (k: string) => String(form.get(k) ?? "");
    if (value("password") !== value("confirmPassword")) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        username: value("username").trim(),
        password: value("password"),
        confirmPassword: value("confirmPassword"),
        fullname: value("fullname").trim(),
        email: value("email").trim(),
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="row justify-content-center">
          <div className="col-12 py-3">
            <form onSubmit={onSubmit}>
              <div className="row text-center mx-2 fs-3 fw-bold">
                <p>ĐĂNG KÝ</p>
              </div>
              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}
              <div className="row mx-2">
                <label htmlFor="fullname" className="form-label">
                  Họ và tên
                </label>
                <input type="text" className="form-control" id="fullname" name="fullname" placeholder="Nhập họ và tên" autoComplete="name" required maxLength={100} />
              </div>
              <div className="row mt-3 mx-2">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  required
                  minLength={3}
                  maxLength={45}
                  pattern="[a-zA-Z0-9_.]+"
                  title="Chỉ gồm chữ, số, dấu _ và ."
                />
              </div>
              <div className="row mt-3 mx-2">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input type="email" className="form-control" id="email" name="email" placeholder="Nhập email" autoComplete="email" required maxLength={45} />
              </div>
              <div className="row mt-3 mx-2">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Mật khẩu ít nhất 8 ký tự"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                />
              </div>
              <div className="row mt-3 mx-2">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu" autoComplete="new-password" required />
              </div>
              <div className="row mt-3 mx-2">
                <div className="col-md-12 d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </div>
              </div>
              <div className="row mt-3 mx-2 text-center">
                <span>
                  Đã có tài khoản?<Link to="/login">Đăng nhập</Link>
                </span>
              </div>
              <div className="row mx-2 text-center">
                <Link to="/">Trang chủ</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
