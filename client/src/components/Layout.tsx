import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand bg-body-tertiary border-bottom mb-4">
        <div className="container">
          <NavLink to="/" className="navbar-brand fw-bold">
            Ho<span className="text-success">stay</span>
          </NavLink>
          <div className="navbar-nav">
            <NavLink to="/rooms" className="nav-link">
              Đặt phòng
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="container pb-5">
        <Outlet />
      </main>
    </>
  );
}
