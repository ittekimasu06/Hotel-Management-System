import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function ContactPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setSubmitting(true);
    try {
      await api("/contacts", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) });
      formEl.reset();
      setMessage({ type: "success", text: "Gửi phản hồi thành công! Chúng tôi sẽ trả lời qua email sớm nhất có thể." });
    } catch (err) {
      setMessage({ type: "danger", text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row g-5">
      <div className="col-lg-4">
        <h1 className="h3">Liên hệ chúng tôi</h1>
        <p className="text-muted">
          <i className="bi bi-chat-square-text text-success me-2" />
          Liên hệ với nhân viên về đơn đặt của bạn, chúng tôi sẽ phản hồi ngay khi có thể.
        </p>
        <p className="text-muted">
          <i className="bi bi-telephone text-success me-2" />
          Trong trường hợp khẩn cấp, bạn có thể gọi cho chúng tôi 24/7.
        </p>
      </div>
      <div className="col-lg-8">
        <h2 className="h5 mb-3">Gửi phản hồi</h2>
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="c-fullname">
                Họ tên
              </label>
              <input id="c-fullname" name="fullname" className="form-control" defaultValue={user?.fullname} required maxLength={100} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="c-email">
                Email
              </label>
              <input id="c-email" name="email" type="email" className="form-control" defaultValue={user?.email} required maxLength={100} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="c-subject">
                Tiêu đề
              </label>
              <input id="c-subject" name="subject" className="form-control" required maxLength={200} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="c-notes">
                Nội dung
              </label>
              <textarea id="c-notes" name="notes" className="form-control" rows={6} required maxLength={5000} />
            </div>
          </div>
          <button className="btn btn-success mt-3" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi phản hồi"}
          </button>
        </form>
      </div>
    </div>
  );
}
