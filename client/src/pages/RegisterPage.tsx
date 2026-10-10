import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RegisterPage() {
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
        username: value("username"),
        password: value("password"),
        confirmPassword: value("confirmPassword"),
        fullname: value("fullname"),
        email: value("email"),
        phone: value("phone") || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-5">
        <h1 className="h3 mb-3">Đăng ký</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="fullname">
              Họ tên
            </label>
            <input id="fullname" name="fullname" className="form-control" autoComplete="name" required maxLength={100} />
          </div>
          <div className="row">
            <div className="col-sm-7 mb-3">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" className="form-control" autoComplete="email" required maxLength={45} />
            </div>
            <div className="col-sm-5 mb-3">
              <label className="form-label" htmlFor="phone">
                Số điện thoại
              </label>
              <input id="phone" name="phone" type="tel" className="form-control" autoComplete="tel" maxLength={20} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              className="form-control"
              autoComplete="username"
              required
              minLength={3}
              maxLength={45}
              pattern="[a-zA-Z0-9_.]+"
              title="Chỉ gồm chữ, số, dấu _ và ."
            />
          </div>
          <div className="row">
            <div className="col-sm-6 mb-3">
              <label className="form-label" htmlFor="password">
                Mật khẩu
              </label>
              <input id="password" name="password" type="password" className="form-control" autoComplete="new-password" required minLength={8} maxLength={72} />
            </div>
            <div className="col-sm-6 mb-3">
              <label className="form-label" htmlFor="confirmPassword">
                Nhập lại mật khẩu
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" autoComplete="new-password" required />
            </div>
          </div>
          <button className="btn btn-success w-100" disabled={submitting}>
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
        <p className="mt-3 text-center">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
