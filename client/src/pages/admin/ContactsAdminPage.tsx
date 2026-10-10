import { useState, type FormEvent } from "react";
import { api, formatDate } from "../../api/client";
import { Pagination } from "../../components/Pagination";
import type { AdminContact } from "./adminApi";
import { useAdminList } from "./useAdminList";

export function ContactsAdminPage() {
  const { data, error, setError, reload, params, setFilter, setPage } = useAdminList<AdminContact>("/admin/contacts");
  const [open, setOpen] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function act(path: string, init: RequestInit, success?: string) {
    try {
      await api(path, init);
      setError(null);
      setNotice(success ?? null);
      reload();
    } catch (e) {
      setNotice(null);
      setError((e as Error).message);
    }
  }

  function onReply(e: FormEvent<HTMLFormElement>, c: AdminContact) {
    e.preventDefault();
    const message = String(new FormData(e.currentTarget).get("message") ?? "");
    act(`/admin/contacts/${c.id}/reply`, { method: "POST", body: JSON.stringify({ message }) }, `Đã gửi trả lời tới ${c.email}`);
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Liên hệ</h1>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={params.get("seen") ?? ""} onChange={(e) => setFilter("seen", e.target.value)}>
            <option value="">Tất cả</option>
            <option value="false">Chưa xem</option>
            <option value="true">Đã xem</option>
          </select>
          <a href="/api/admin/exports/contacts.xlsx" className="btn btn-outline-success btn-sm text-nowrap" download>
            <i className="bi bi-file-earmark-excel me-1" />
            Xuất Excel
          </a>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p>Đang tải...</p>}

      <div className="list-group">
        {data?.items.map((c) => (
          <div key={c.id} className="list-group-item">
            <div className="d-flex justify-content-between gap-2">
              <button className="btn btn-link p-0 text-start text-decoration-none" onClick={() => setOpen(open === c.id ? null : c.id)}>
                {!c.seen && <span className="badge text-bg-warning me-2">Mới</span>}
                <span className="fw-semibold">{c.subject}</span>
                <span className="small text-muted ms-2">
                  {c.fullname} · {formatDate(c.createdAt)}
                </span>
              </button>
              <i className={`bi ${open === c.id ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden />
            </div>

            {open === c.id && (
              <div className="mt-3">
                <div className="small text-muted mb-1">{c.email}</div>
                <p style={{ whiteSpace: "pre-wrap" }}>{c.notes}</p>
                <form onSubmit={(e) => onReply(e, c)} className="mb-2">
                  <textarea name="message" className="form-control form-control-sm mb-2" rows={4} placeholder="Nội dung trả lời qua email" required maxLength={10000} />
                  <button className="btn btn-success btn-sm">
                    <i className="bi bi-send me-1" />
                    Gửi trả lời
                  </button>
                </form>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => act(`/admin/contacts/${c.id}/seen`, { method: "PUT", body: JSON.stringify({ seen: !c.seen }) })}
                  >
                    {c.seen ? "Đánh dấu chưa xem" : "Đánh dấu đã xem"}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => window.confirm(`Xóa liên hệ "${c.subject}"?`) && act(`/admin/contacts/${c.id}`, { method: "DELETE" })}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {data?.items.length === 0 && <p className="text-muted">Không có liên hệ nào.</p>}
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  );
}
