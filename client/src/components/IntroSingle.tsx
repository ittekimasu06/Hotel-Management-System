import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Tiêu đề trang có vạch xanh bên trái và breadcrumb (khối "Intro Single" của template cũ) */
export function IntroSingle({
  title,
  subtitle,
  crumbs,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Các mục breadcrumb sau "Trang chủ"; mục cuối là trang hiện tại */
  crumbs: { label: string; to?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="intro-single">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div className="title-single-box">
              <h1 className="title-single">{title}</h1>
              {subtitle && <span className="color-text-a">{subtitle}</span>}
              {children}
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <nav aria-label="breadcrumb" className="breadcrumb-box d-flex justify-content-lg-end">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/">Trang chủ</Link>
                </li>
                {crumbs.map((c, i) =>
                  c.to && i < crumbs.length - 1 ? (
                    <li className="breadcrumb-item" key={c.label}>
                      <Link to={c.to}>{c.label}</Link>
                    </li>
                  ) : (
                    <li className="breadcrumb-item active" aria-current="page" key={c.label}>
                      {c.label}
                    </li>
                  ),
                )}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
