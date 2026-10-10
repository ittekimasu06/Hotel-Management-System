import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useLegacyStyle } from "../../legacy/useLegacyStyle";
import adminCss from "../../legacy/admin_style.css?inline";
import type { Dashboard } from "./adminApi";

const EXTRA_CSS = `
* { font-family: "Nunito", sans-serif; font-optical-sizing: auto; }
.bi::before, [class^="bi-"]::before, [class*=" bi-"]::before { font-family: "bootstrap-icons" !important; }
`;

type Group = { id: string; label: string; icon: string; prefix: string; links: { to: string; label: string }[] };

/** Menu con trong sidebar (giống admin/layouts/sidebar.php) */
const GROUPS: Group[] = [
  {
    id: "user",
    label: "Người sử dụng",
    icon: "bi-people",
    prefix: "/admin/users",
    links: [
      { to: "/admin/users", label: "Danh sách" },
      { to: "/admin/users/new", label: "Thêm mới" },
    ],
  },
  {
    id: "bill",
    label: "Đơn đặt phòng",
    icon: "bi-journal-text",
    prefix: "/admin/b",
    links: [
      { to: "/admin/bookings", label: "Danh sách" },
      { to: "/admin/bill-statuses", label: "Trạng thái" },
    ],
  },
  {
    id: "room",
    label: "Phòng",
    icon: "bi-layout-text-window-reverse",
    prefix: "/admin/room",
    links: [
      { to: "/admin/rooms", label: "Danh sách" },
      { to: "/admin/rooms/new", label: "Thêm mới" },
      { to: "/admin/room-types", label: "Loại phòng" },
    ],
  },
  {
    id: "contact",
    label: "Phản hồi",
    icon: "bi-chat-dots",
    prefix: "/admin/contacts",
    links: [{ to: "/admin/contacts", label: "Danh sách" }],
  },
];

function Sidebar({ onLogout }: { onLogout: (e: MouseEvent) => void }) {
  const { pathname } = useLocation();
  const current = GROUPS.find((g) => pathname.startsWith(g.prefix))?.id ?? null;
  const [open, setOpen] = useState<string | null>(current);

  useEffect(() => setOpen(current), [current]);

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link className={`nav-link ${pathname === "/admin" ? "" : "collapsed"}`} to="/admin">
            <i className="bi bi-grid" />
            <span>Thống kê</span>
          </Link>
        </li>

        {GROUPS.map((g) => (
          <li className="nav-item" key={g.id}>
            <a
              className={`nav-link ${current === g.id ? "" : "collapsed"}`}
              href="#"
              aria-expanded={open === g.id}
              onClick={(e) => {
                e.preventDefault();
                setOpen(open === g.id ? null : g.id);
              }}
            >
              <i className={`bi ${g.icon}`} />
              <span>{g.label}</span>
              <i className="bi bi-chevron-down ms-auto" />
            </a>
            <ul className={`nav-content collapse ${open === g.id ? "show" : ""}`}>
              {g.links.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end>
                    <i className="bi bi-circle" />
                    <span>{l.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        ))}

        <li className="nav-heading">Pages</li>
        {[
          { to: "/", icon: "bi-card-list", label: "Hostay" },
          { to: "/about", icon: "bi-exclamation-circle", label: "Giới thiệu" },
          { to: "/rooms", icon: "bi-send", label: "Đặt phòng" },
          { to: "/contact", icon: "bi-envelope", label: "Liên hệ" },
          { to: "/account", icon: "bi-person", label: "Thông tin cá nhân" },
        ].map((p) => (
          <li className="nav-item" key={p.to}>
            <Link className="nav-link collapsed" to={p.to}>
              <i className={`bi ${p.icon}`} />
              <span>{p.label}</span>
            </Link>
          </li>
        ))}
        <li className="nav-item">
          <a className="nav-link collapsed" href="#" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" />
            <span>Đăng xuất</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}

/** Chuông thông báo: số liên hệ chưa xem và đơn chờ xử lý (bản cũ hiển thị dữ liệu mẫu) */
function Notifications() {
  const { pathname } = useLocation();
  const [data, setData] = useState<Pick<Dashboard, "unseenContacts" | "pendingBookings"> | null>(null);

  useEffect(() => {
    api<Dashboard>("/admin/dashboard")
      .then((d) => setData({ unseenContacts: d.unseenContacts, pendingBookings: d.pendingBookings }))
      .catch(() => setData(null));
  }, [pathname]);

  const total = (data?.unseenContacts ?? 0) + (data?.pendingBookings ?? 0);

  return (
    <li className="nav-item dropdown">
      <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown" aria-label="Thông báo" onClick={(e) => e.preventDefault()}>
        <i className="bi bi-bell" />
        {total > 0 && <span className="badge bg-primary badge-number">{total}</span>}
      </a>
      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
        <li className="dropdown-header">Bạn có {total} việc cần xử lý</li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="notification-item">
          <i className="bi bi-exclamation-circle text-warning" />
          <div>
            <h4>
              <Link to="/admin/bookings?statusId=1&cancelled=false">Đơn chờ xử lý</Link>
            </h4>
            <p>{data?.pendingBookings ?? 0} đơn đang chờ duyệt</p>
          </div>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="notification-item">
          <i className="bi bi-info-circle text-primary" />
          <div>
            <h4>
              <Link to="/admin/contacts?seen=false">Phản hồi mới</Link>
            </h4>
            <p>{data?.unseenContacts ?? 0} phản hồi chưa xem</p>
          </div>
        </li>
      </ul>
    </li>
  );
}

/** Layout trang quản trị, chuyển từ admin/layouts/header.php, sidebar.php, footer.php */
export function AdminLayout() {
  useLegacyStyle("admin", adminCss + EXTRA_CSS);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [searchShown, setSearchShown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSearchShown(false);
  }, [location.pathname]);

  // Gỡ class thu gọn sidebar khỏi <body> khi rời trang quản trị
  useEffect(() => () => document.body.classList.remove("toggle-sidebar"), []);

  async function onLogout(e: MouseEvent) {
    e.preventDefault();
    await logout();
    navigate("/admin");
  }

  /** Ô tìm kiếm trên header lọc danh sách của trang hiện tại theo từ khóa */
  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const key = String(new FormData(e.currentTarget).get("key") ?? "").trim();
    const listPage = /^\/admin\/(users|rooms|bookings)$/.test(location.pathname) ? location.pathname : "/admin/rooms";
    navigate(key ? `${listPage}?key=${encodeURIComponent(key)}` : listPage);
  }

  return (
    <>
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/admin" className="logo d-flex align-items-center">
            <img src="/img/admin-logo.png" alt="" />
            <span className="d-none d-lg-block">HostayAdmin</span>
          </Link>
          <i className="bi bi-list toggle-sidebar-btn" role="button" aria-label="Thu gọn menu" onClick={() => document.body.classList.toggle("toggle-sidebar")} />
        </div>

        <div className={`search-bar ${searchShown ? "search-bar-show" : ""}`}>
          <form className="search-form d-flex align-items-center" onSubmit={onSearch} key={location.pathname}>
            <input type="text" name="key" placeholder="Search" title="Nhập từ khóa tìm kiếm" defaultValue={params.get("key") ?? ""} />
            <button type="submit" title="Search">
              <i className="bi bi-search" />
            </button>
          </form>
        </div>

        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item d-block d-lg-none">
              <a
                className="nav-link nav-icon search-bar-toggle"
                href="#"
                aria-label="Tìm kiếm"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchShown((s) => !s);
                }}
              >
                <i className="bi bi-search" />
              </a>
            </li>

            <Notifications />

            <li className="nav-item dropdown pe-3">
              <a className="nav-link nav-profile d-flex align-items-center pe-0 avatar-profile" href="#" data-bs-toggle="dropdown" aria-label="Tài khoản" onClick={(e) => e.preventDefault()}>
                <img src="/img/user-profile.jpg" alt="Profile" className="rounded-circle avatar-profile-img" />
              </a>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                <li className="dropdown-header">
                  <h6>{user?.fullname}</h6>
                  <span>{user?.username}</span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center" to="/account">
                    <i className="bi bi-person" />
                    <span>Thông tin cá nhân</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center" to="/contact">
                    <i className="bi bi-question-circle" />
                    <span>Cần giúp đỡ?</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right" />
                    <span>Đăng xuất</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>

      <Sidebar onLogout={onLogout} />

      <main id="main" className="main">
        <Outlet />
      </main>

      <footer id="footer" className="footer">
        <div className="copyright">
          &copy; Copyright{" "}
          <strong>
            <span>HostayAdmin</span>
          </strong>
          . All Rights Reserved
        </div>
      </footer>
      <a
        href="#"
        className={`back-to-top d-flex align-items-center justify-content-center ${scrolled ? "active" : ""}`}
        aria-label="Lên đầu trang"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <i className="bi bi-arrow-up-short" />
      </a>
    </>
  );
}
