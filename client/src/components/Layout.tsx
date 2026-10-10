import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Permission, useAuth } from "../auth/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <>
      <nav className="navbar navbar-expand bg-body-tertiary border-bottom mb-4 d-print-none">
        <div className="container">
          <NavLink to="/" className="navbar-brand fw-bold">
            Ho<span className="text-success">stay</span>
          </NavLink>
          <div className="navbar-nav me-auto">
            <NavLink to="/rooms" className="nav-link">
              Đặt phòng
            </NavLink>
            <NavLink to="/contact" className="nav-link">
              Liên hệ
            </NavLink>
            {user && (
              <NavLink to="/bookings" className="nav-link">
                Đơn của tôi
              </NavLink>
            )}
            {user && user.permission >= Permission.STAFF && (
              <NavLink to="/admin" className="nav-link">
                Quản trị
              </NavLink>
            )}
          </div>
          <div className="navbar-nav align-items-center">
            {user ? (
              <>
                <NavLink to="/account" className="nav-link">
                  <i className="bi bi-person-circle me-1" />
                  {user.fullname}
                </NavLink>
                <button className="btn btn-outline-secondary btn-sm ms-2" onClick={onLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">
                  Đăng nhập
                </NavLink>
                <NavLink to="/register" className="btn btn-success btn-sm ms-2">
                  Đăng ký
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container pb-5">
        <Outlet />
      </main>
    </>
  );
}
