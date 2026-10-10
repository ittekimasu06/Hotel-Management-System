/** Phân trang rút gọn: trang đầu, cuối và 2 trang quanh trang hiện tại */
export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2]);
  const visible = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav className="mt-3">
      <ul className="pagination pagination-sm justify-content-center flex-wrap">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page - 1)} aria-label="Trang trước">
            &laquo;
          </button>
        </li>
        {visible.flatMap((p, i) => [
          ...(i > 0 && p - visible[i - 1] > 1
            ? [
                <li key={`gap-${p}`} className="page-item disabled" aria-hidden>
                  <span className="page-link">…</span>
                </li>,
              ]
            : []),
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => onChange(p)} aria-current={p === page ? "page" : undefined}>
              {p}
            </button>
          </li>,
        ])}
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page + 1)} aria-label="Trang sau">
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}
