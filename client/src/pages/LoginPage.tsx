import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLegacyStyle } from "../legacy/useLegacyStyle";
import authCss from "../legacy/auth.css?inline";

/** Trang đăng nhập, chuyển từ views/login.php */
export function LoginPage() {
  useLegacyStyle("auth", authCss);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setSubmitting(true);
    try {
      await login(String(form.get("username")), String(form.get("password")));
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="row justify-content-center">
          <div className="col-sm-12 py-3">
            <form onSubmit={onSubmit}>
              <div className="row text-center mx-2 fs-3 fw-bold">
                <p>ĐĂNG NHẬP</p>
              </div>
              {(error || location.state) && (
                <div className="auth-error" role="alert">
                  {error ?? "Vui lòng đăng nhập để sử dụng dịch vụ!"}
                </div>
              )}
              <div className="row mt-3 mx-2">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input type="text" className="form-control" id="username" name="username" placeholder="Nhập tên đăng nhập" autoComplete="username" required />
              </div>
              <div className="row mt-3 mx-2">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <input type="password" className="form-control" id="password" name="password" placeholder="Nhập mật khẩu" autoComplete="current-password" required />
              </div>
              <div className="row mt-3 mx-2">
                <div className="col-md-12 d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </div>
              </div>
              <div className="row mt-3 mx-2 text-center">
                <span>
                  Bạn chưa có tài khoản?<Link to="/register">Đăng ký</Link>
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
