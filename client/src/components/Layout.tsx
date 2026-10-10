import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api, type RoomType } from "../api/client";
import { Permission, useAuth } from "../auth/AuthContext";
import { useLegacyStyle } from "../legacy/useLegacyStyle";
import viewsCss from "../legacy/views_style.css?inline";
import extraCss from "../legacy/site-extra.css?inline";

/** Địa điểm trong bộ lọc tìm kiếm (giống views/layouts/searchForm.php) */
const CITIES = [
  ["Cát Bà", "Cát Bà"],
  ["Nha Trang", "Nha Trang"],
  ["Hạ Long", "Hạ Long"],
  ["Đà Lạt", "Đà Lạt"],
  ["Đà Nẵng", "Đà nẵng"],
  ["Vũng Tàu", "Vũng Tàu"],
  ["Thanh Hóa", "Thanh Hóa"],
  ["Cần Thơ", "Cần Thơ"],
  ["Hồ Chí Minh", "Tp.Hồ Chí Minh"],
  ["Hà Nội", "Hà Nội"],
];

/** Hộp tìm kiếm trượt từ cạnh phải; mở/đóng bằng class trên <body> như template gốc */
function setSearchOpen(open: boolean) {
  document.body.classList.toggle("box-collapse-open", open);
  document.body.classList.toggle("box-collapse-closed", !open);
}

function SearchPanel() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    api<RoomType[]>("/room-types").then(setTypes).catch(() => setTypes([]));
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(e.currentTarget)) {
      if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    }
    setSearchOpen(false);
    navigate(`/rooms?${params}`);
  }

  return (
    <>
      <div className="click-closed" onClick={() => setSearchOpen(false)} />
      <div className="box-collapse">
        <div className="title-box-d">
          <h3 className="title-d">Tìm kiếm phòng</h3>
        </div>
        <span className="close-box-collapse right-boxed bi bi-x" role="button" aria-label="Đóng" onClick={() => setSearchOpen(false)} />
        <div className="box-collapse-wrap form">
          <form className="form-a" onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-12 mb-2">
                <div className="form-group">
                  <label className="pb-2" htmlFor="s-key">
                    Từ khóa
                  </label>
                  <input id="s-key" type="text" name="key" className="form-control form-control-lg form-control-a" placeholder="Keyword" />
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="form-group mt-3">
                  <label className="pb-2" htmlFor="s-type">
                    Loại phòng
                  </label>
                  <select name="type" className="form-control form-select form-control-a" id="s-type" defaultValue="">
                    <option value="">Tất cả</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="form-group mt-3">
                  <label className="pb-2" htmlFor="s-city">
                    Địa điểm
                  </label>
                  <select name="address" className="form-control form-select form-control-a" id="s-city" defaultValue="">
                    <option value="">Tất cả</option>
                    {CITIES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="form-group mt-3">
                  <label className="pb-2" htmlFor="s-price">
                    Giá cao nhất
                  </label>
                  <select name="maxPrice" className="form-control form-select form-control-a" id="s-price" defaultValue="">
                    <option value="">Không giới hạn</option>
                    {[20, 50, 100, 150].map((p) => (
                      <option key={p} value={p}>
                        ${p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="form-group mt-3">
                  <label className="pb-2" htmlFor="s-sort">
                    Sắp xếp
                  </label>
                  <select name="sort" className="form-control form-select form-control-a" id="s-sort" defaultValue="">
                    <option value="">Mới nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                  </select>
                </div>
              </div>
              <div className="col-md-12 mt-3">
                <button type="submit" className="btn btn-b">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link to="/login" className="ms-3">
        Đăng nhập
      </Link>
    );
  }

  async function onLogout(e: MouseEvent) {
    e.preventDefault();
    await logout();
    navigate("/");
  }

  return (
    <div className="dropdown ms-3">
      <a className="d-flex align-items-center pe-0 avatar-profile" href="#" data-bs-toggle="dropdown" aria-label="Tài khoản">
        <img src="/img/user-profile.jpg" alt="Profile" className="rounded-circle avatar-profile-img" />
      </a>
      <ul className="dropdown-menu dropdown-menu-end profile">
        <li className="dropdown-header">
          <h6>{user.fullname}</h6>
          <span>{user.username}</span>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <Link className="dropdown-item d-flex align-items-center" to="/account">
            <i className="bi bi-person" />
            <span className="ms-1">Thông tin cá nhân</span>
          </Link>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <Link className="dropdown-item d-flex align-items-center" to="/bookings">
            <i className="bi bi-clock-history" />
            <span className="ms-1">Lịch sử đặt phòng</span>
          </Link>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        {user.permission >= Permission.STAFF && (
          <>
            <li>
              <Link className="dropdown-item d-flex align-items-center" to="/admin">
                <i className="bi bi-gear" />
                <span className="ms-1">Đến trang quản trị</span>
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
          </>
        )}
        <li>
          <Link className="dropdown-item d-flex align-items-center" to="/contact">
            <i className="bi bi-question-circle" />
            <span className="ms-1">Cần giúp đỡ?</span>
          </Link>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" />
            <span className="ms-1">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

function Footer() {
  const { user } = useAuth();
  return (
    <>
      <section className="section-footer">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-4">
              <div className="widget-a">
                <div className="w-header-a">
                  <h3 className="w-title-a text-brand">Hostay</h3>
                </div>
                <div className="w-body-a">
                  <p className="w-text-a color-text-a">
                    Hostay kỳ vọng trở thành nền tảng du lịch nghỉ dưỡng số 1 cho khách hàng Đông Nam Á trong 5 năm tới.
                  </p>
                </div>
                <div className="w-footer-a">
                  <ul className="list-unstyled">
                    <li className="color-a">
                      <span className="color-text-a">Phone .</span> 0123456789
                    </li>
                    <li className="color-a">
                      <span className="color-text-a">Email .</span> hostayhotelgroup@gmail.com
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 section-md-t3">
              <div className="widget-a">
                <div className="w-header-a">
                  <h3 className="w-title-a text-brand">Chỉ Mục</h3>
                </div>
                <div className="w-body-a">
                  <ul className="list-unstyled">
                    {[
                      ["uu-dai", "Ưu đãi"],
                      ["moi-nhat", "Mới nhất"],
                      ["dia-diem", "Địa điểm phổ biến"],
                      ["danh-gia", "Đánh giá"],
                      ["albums", "Albums"],
                    ].map(([id, label]) => (
                      <li className="item-list-a" key={id}>
                        <i className="bi bi-chevron-right" /> <Link to={`/#${id}`}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-4 section-md-t3">
              <div className="widget-a">
                <div className="w-header-a">
                  <h3 className="w-title-a text-brand">Menu</h3>
                </div>
                <div className="w-body-a">
                  <ul className="list-unstyled">
                    <li className="item-list-a">
                      <i className="bi bi-chevron-right" /> <Link to="/">Trang chủ</Link>
                    </li>
                    <li className="item-list-a">
                      <i className="bi bi-chevron-right" /> <Link to="/about">Giới thiệu</Link>
                    </li>
                    <li className="item-list-a">
                      <i className="bi bi-chevron-right" /> <Link to="/rooms">Đặt phòng</Link>
                    </li>
                    <li className="item-list-a">
                      <i className="bi bi-chevron-right" /> <Link to="/contact">Liên hệ</Link>
                    </li>
                    {user && (
                      <li className="item-list-a">
                        <i className="bi bi-chevron-right" /> <Link to="/account">Thông tin cá nhân</Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <nav className="nav-footer">
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <Link to="/">Trang chủ</Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="/about">Giới thiệu</Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="/rooms">Đặt phòng</Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="/contact">Liên hệ</Link>
                  </li>
                </ul>
              </nav>
              <div className="socials-a">
                <ul className="list-inline">
                  {["facebook", "twitter", "instagram", "linkedin"].map((s) => (
                    <li className="list-inline-item" key={s}>
                      <a href="#" aria-label={s}>
                        <i className={`bi bi-${s}`} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

const NAV = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/about", label: "Giới thiệu" },
  { to: "/rooms", label: "Đặt phòng" },
  { to: "/contact", label: "Liên hệ" },
];

/** Layout trang khách, chuyển từ views/layouts/header.php + footer.php */
export function Layout() {
  useLegacyStyle("views", viewsCss + extraCss);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Thu nhỏ thanh điều hướng và hiện nút "lên đầu trang" khi cuộn (views_main.js)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Đổi trang: đóng menu/hộp tìm kiếm, cuộn tới mục (#id) hoặc lên đầu trang
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // Gỡ class của hộp tìm kiếm khỏi <body> khi rời layout này
  useEffect(() => () => document.body.classList.remove("box-collapse-open", "box-collapse-closed"), []);

  return (
    <>
      <SearchPanel />
      <nav className={`navbar navbar-default navbar-expand-lg fixed-top ${scrolled ? "navbar-reduce" : "navbar-trans"}`}>
        <div className="container">
          <button
            className={`navbar-toggler ${menuOpen ? "" : "collapsed"}`}
            type="button"
            aria-expanded={menuOpen}
            aria-label="Mở menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <Link className="navbar-brand text-brand" to="/">
            <span className="color-b">Hostay</span>
          </Link>

          <div className={`navbar-collapse collapse justify-content-center ${menuOpen ? "show" : ""}`}>
            <ul className="navbar-nav">
              {NAV.map((n) => (
                <li className="nav-item" key={n.to}>
                  <NavLink className="nav-link" to={n.to} end={n.end}>
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className="btn btn-b-n navbar-toggle-box navbar-toggle-box-collapse" aria-label="Tìm kiếm phòng" onClick={() => setSearchOpen(true)}>
            <i className="bi bi-search" />
          </button>

          <UserMenu />
        </div>
      </nav>

      <Outlet />

      <Footer />
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
