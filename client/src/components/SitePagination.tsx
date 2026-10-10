import type { MouseEvent } from "react";

/** Phân trang kiểu trang khách cũ (views/components/Paging.php): căn phải, mũi tên chevron */
export function SitePagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const go = (p: number) => (e: MouseEvent) => {
    e.preventDefault();
    onChange(p);
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <nav className="pagination-a">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${page <= 1 ? "disabled" : "next"}`}>
              <a className="page-link" href="#" aria-label="Trang trước" onClick={go(page - 1)}>
                <span className="bi bi-chevron-left" />
              </a>
            </li>
            {pages.flatMap((p, i) => [
              ...(i > 0 && p - pages[i - 1] > 1
                ? [
                    <li className="page-item disabled" key={`gap-${p}`}>
                      <span className="page-link">...</span>
                    </li>,
                  ]
                : []),
              <li className={`page-item ${p === page ? "active" : ""}`} key={p}>
                <a className="page-link" href="#" onClick={go(p)}>
                  {p}
                </a>
              </li>,
            ])}
            <li className={`page-item ${page >= totalPages ? "disabled" : "next"}`}>
              <a className="page-link" href="#" aria-label="Trang sau" onClick={go(page + 1)}>
                <span className="bi bi-chevron-right" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
