import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Tổng quan", icon: "bi-grid", end: true },
  { to: "/admin/bookings", label: "Đơn đặt phòng", icon: "bi-receipt" },
  { to: "/admin/bill-statuses", label: "Trạng thái đơn", icon: "bi-tags" },
  { to: "/admin/rooms", label: "Phòng", icon: "bi-building" },
  { to: "/admin/room-types", label: "Loại phòng", icon: "bi-collection" },
  { to: "/admin/users", label: "Người dùng", icon: "bi-people" },
  { to: "/admin/contacts", label: "Liên hệ", icon: "bi-envelope" },
];

export function AdminLayout() {
  return (
    <div className="row g-4">
      <aside className="col-lg-2">
        <nav className="nav nav-pills flex-lg-column gap-1 small">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link py-2">
              <i className={`bi ${l.icon} me-2`} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="col-lg-10">
        <Outlet />
      </section>
    </div>
  );
}
