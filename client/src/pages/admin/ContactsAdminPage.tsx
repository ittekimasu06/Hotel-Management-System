import { useState, type FormEvent } from "react";
import { api, formatDate } from "../../api/client";
import { Pagination } from "../../components/Pagination";
import type { AdminContact } from "./adminApi";
import { useAdminList } from "./useAdminList";
import { actionButtons, DetailRow, Modal, PageCard, PageTitle } from "./ui";

const dashDate = (v: string) => formatDate(v).replaceAll("/", "-");

/** Phản hồi của khách hàng, chuyển từ admin/contacts.php */
export function ContactsAdminPage() {
  const { data, error, setError, reload, params, setFilter, setPage } = useAdminList<AdminContact>("/admin/contacts");
  const [viewing, setViewing] = useState<AdminContact | null>(null);
  const [deleting, setDeleting] = useState<AdminContact | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function act<T>(path: string, init: RequestInit) {
    const result = await api<T>(path, init);
    reload();
    return result;
  }

  async function onReply(e: FormEvent<HTMLFormElement>, c: AdminContact) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const message = String(new FormData(formEl).get("message") ?? "");
    setSending(true);
    try {
      const updated = await act<AdminContact>(`/admin/contacts/${c.id}/reply`, { method: "POST", body: JSON.stringify({ message }) });
      formEl.reset();
      setViewing(updated);
      setNotice({ ok: true, text: `Đã gửi trả lời tới ${c.email}` });
    } catch (err) {
      setNotice({ ok: false, text: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  async function toggleSeen(c: AdminContact) {
    try {
      setViewing(await act<AdminContact>(`/admin/contacts/${c.id}/seen`, { method: "PUT", body: JSON.stringify({ seen: !c.seen }) }));
    } catch (err) {
      setNotice({ ok: false, text: (err as Error).message });
    }
  }

  async function remove(c: AdminContact) {
    try {
      await act(`/admin/contacts/${c.id}`, { method: "DELETE" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageTitle title="Danh sách" crumbs={[{ label: "Phản hồi của khách hàng" }]} />
      <PageCard>
        <div className="row my-3 g-2 align-items-center">
          <div className="col-md-9">
            <a href="/api/admin/exports/contacts.xlsx" className="btn btn-success" download>
              <i className="bi bi-filetype-xlsx" /> Xuất Excel
            </a>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" aria-label="Lọc trạng thái" value={params.get("seen") ?? ""} onChange={(e) => setFilter("seen", e.target.value)}>
              <option value="">Tất cả</option>
              <option value="false">Chưa xem</option>
              <option value="true">Đã xem</option>
            </select>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {data && (
          <>
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Họ tên</th>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col" colSpan={2}>
                    Thực hiện
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="align-middle">
                      {c.id}
                    </th>
                    <td className="align-middle">{c.fullname}</td>
                    <td className="align-middle">{c.subject}</td>
                    <td className="align-middle">{dashDate(c.createdAt)}</td>
                    <td className="align-middle">{c.seen ? <span className="text-success">Đã xem</span> : <span className="text-danger">Chưa xem</span>}</td>
                    <td className="align-middle" style={{ width: 1 }}>
                      <button
                        className={actionButtons.view}
                        onClick={() => {
                          setNotice(null);
                          setViewing(c);
                        }}
                        aria-label="Xem"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                    <td className="align-middle">
                      <button className={actionButtons.remove} onClick={() => setDeleting(c)} aria-label="Xóa">
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>Không có dữ liệu!</p>}
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </>
        )}
      </PageCard>

      {viewing && (
        <Modal
          title="Thông tin phản hồi"
          onClose={() => setViewing(null)}
          footer={
            <button className="btn btn-outline-primary" onClick={() => toggleSeen(viewing)}>
              {viewing.seen ? "Đánh dấu chưa xem" : "Đánh dấu đã xem"}
            </button>
          }
        >
          {notice && <div className={`alert ${notice.ok ? "alert-success" : "alert-danger"} py-2`}>{notice.text}</div>}
          <DetailRow label="Họ tên">{viewing.fullname}</DetailRow>
          <DetailRow label="Email">{viewing.email}</DetailRow>
          <DetailRow label="Tiêu đề">{viewing.subject}</DetailRow>
          <DetailRow label="Nội dung">{viewing.notes}</DetailRow>
          <DetailRow label="Ngày tạo">{dashDate(viewing.createdAt)}</DetailRow>
          <div className="row mt-3">
            <form onSubmit={(e) => onReply(e, viewing)}>
              <div className="row mb-3">
                <div className="col-md-12">
                  <label htmlFor="reply" className="form-label fw-bold">
                    Trả lời khách hàng
                  </label>
                  <textarea className="form-control" name="message" id="reply" rows={5} placeholder="Nội dung" required maxLength={10000} />
                </div>
              </div>
              <button type="submit" className="btn btn-dark" disabled={sending}>
                <i className="bi bi-send" /> {sending ? "Đang gửi..." : "Trả lời"}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Xóa phản hồi"
          onClose={() => setDeleting(null)}
          footer={
            <button className="btn btn-danger" onClick={() => remove(deleting)}>
              Xóa
            </button>
          }
        >
          <p>Bạn có chắc chắn muốn xóa phản hồi này:</p>
          <p>
            <b>Họ tên: </b>
            {deleting.fullname}
          </p>
          <p>
            <b>Chủ đề: </b>
            {deleting.subject}
          </p>
        </Modal>
      )}
    </>
  );
}
