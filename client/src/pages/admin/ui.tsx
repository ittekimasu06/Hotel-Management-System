import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";

/** Tiêu đề trang và breadcrumb của NiceAdmin */
export function PageTitle({ title, crumbs }: { title: string; crumbs: { label: string; to?: string }[] }) {
  return (
    <div className="pagetitle d-flex justify-content-between">
      <h1>{title}</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin">Trang chủ</Link>
          </li>
          {crumbs.map((c, i) =>
            c.to && i < crumbs.length - 1 ? (
              <li className="breadcrumb-item" key={c.label}>
                <Link to={c.to}>{c.label}</Link>
              </li>
            ) : (
              <li className="breadcrumb-item active" key={c.label}>
                {c.label}
              </li>
            ),
          )}
        </ol>
      </nav>
    </div>
  );
}

/** Khối card trắng chiếm toàn bộ chiều ngang */
export function PageCard({ children }: { children: ReactNode }) {
  return (
    <section className="section">
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Popup theo markup Bootstrap, điều khiển bằng state của React */
export function Modal({
  title,
  onClose,
  children,
  footer,
  size,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "lg";
}) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
        <div className={`modal-dialog modal-dialog-scrollable ${size === "lg" ? "modal-lg" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">{title}</h1>
              <button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              {footer}
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Thoát
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

/** Nút icon trong cột "Thực hiện" */
export const actionButtons = {
  view: "btn btn-primary btn-sm",
  edit: "btn btn-success btn-sm",
  remove: "btn btn-danger btn-sm",
};

/** Dòng "nhãn: giá trị" trong popup chi tiết */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="row mt-3">
      <div className="col-sm-12 fw-bold">{label}:</div>
      <div className="col-sm-12" style={{ whiteSpace: "pre-wrap" }}>
        {children}
      </div>
    </div>
  );
}
