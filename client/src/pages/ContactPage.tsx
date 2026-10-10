import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const GREEN = { color: "#2eca6a" };

/** Trang liên hệ, chuyển từ views/contact.php */
export function ContactPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setSubmitting(true);
    try {
      await api("/contacts", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(formEl))) });
      formEl.reset();
      setMessage({ ok: true, text: "Gửi phản hồi thành công!" });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main">
      <section className="intro-single">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-lg-8">
              <div className="title-single-box">
                <h1 className="title-single">Liên hệ chúng tôi</h1>
                <p className="row color-text-a align-items-center">
                  <i className="bi bi-chat-square-text col-1 fs-3" style={GREEN} />
                  <span className="col-11">Liên hệ với nhân viên chúng tôi về đơn đặt của bạn và chúng tôi sẽ phản hồi ngay khi có thể.</span>
                </p>
                <p className="row color-text-a align-items-center">
                  <i className="bi bi-telephone col-1 fs-3" style={GREEN} />
                  <span className="col-11">Trong trường hợp khẩn cấp, bạn có thể gọi cho chúng tôi 24/7 bằng số địa phương hoặc quốc tế.</span>
                </p>
                <p className="row color-text-a align-items-center">
                  <i className="bi bi-buildings col-1 fs-3" style={GREEN} />
                  <span className="col-11">Chỗ nghỉ thường là người biết rõ nhất về thông tin chi tiết cho lưu trú của bạn.</span>
                </p>
              </div>
            </div>
            <div className="col-md-12 col-lg-4">
              <nav aria-label="breadcrumb" className="breadcrumb-box d-flex justify-content-lg-end">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">Trang chủ</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Liên hệ
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section className="contact mb-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title-single-box">
                <h1 className="title-single">Gửi phản hồi</h1>
              </div>
            </div>
          </div>
          <div className="row d-flex justify-content-center">
            <div className="col-md-12">
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-4 mt-3">
                    <label htmlFor="fullname" className="form-label text-dark fw-bold">
                      Họ tên
                    </label>
                    <input type="text" className="form-control" id="fullname" name="fullname" required maxLength={100} placeholder="Tên đầy đủ" defaultValue={user?.fullname} />
                  </div>
                  <div className="col-md-4 mt-3">
                    <label htmlFor="email" className="form-label text-dark fw-bold">
                      Email
                    </label>
                    <input type="email" className="form-control" id="email" name="email" required maxLength={100} placeholder="Email" defaultValue={user?.email} />
                  </div>
                  <div className="col-md-4 mt-3">
                    <label htmlFor="subject" className="form-label text-dark fw-bold">
                      Tiêu đề
                    </label>
                    <input type="text" className="form-control" id="subject" name="subject" required maxLength={200} placeholder="Tiêu đề" />
                  </div>
                  <div className="col-md-12 mt-3">
                    <label htmlFor="note" className="form-label text-dark fw-bold">
                      Nội dung
                    </label>
                    <textarea name="notes" id="note" rows={5} className="form-control" required maxLength={5000} placeholder="Nhập nội dung tại đây" />
                  </div>
                  <div className="col-md-12 mt-3 d-flex justify-content-center">
                    <button type="submit" className="btn btn-dark px-4 fs-5" disabled={submitting}>
                      <i className="bi bi-send" /> Gửi phản hồi
                    </button>
                  </div>
                  {message && (
                    <div className="col-md-12">
                      <p className={message.ok ? "text-success" : "text-danger"}>{message.text}</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="contact">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 section-t2">
              <div className="row justify-content-around">
                <div className="col-md-4 icon-box section-b2">
                  <div className="icon-box-icon">
                    <span className="bi bi-envelope" />
                  </div>
                  <div className="icon-box-content table-cell">
                    <div className="icon-box-title">
                      <h4 className="icon-title">Say Hello</h4>
                    </div>
                    <div className="icon-box-content">
                      <p className="mb-1">
                        Email. <span className="color-a">hostaysupporter@gmail.com</span>
                      </p>
                      <p className="mb-1">
                        Điện thoại. <span className="color-a">+84 356 945 234</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 icon-box section-b2">
                  <div className="icon-box-icon">
                    <span className="bi bi-geo-alt" />
                  </div>
                  <div className="icon-box-content table-cell">
                    <div className="icon-box-title">
                      <h4 className="icon-title">Tìm chúng tôi ở</h4>
                    </div>
                    <div className="icon-box-content">
                      <p className="mb-1">
                        Bắc Từ Liêm, Hà Nội,
                        <br /> VN.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 icon-box">
                  <div className="icon-box-icon">
                    <span className="bi bi-share" />
                  </div>
                  <div className="icon-box-content table-cell">
                    <div className="icon-box-title">
                      <h4 className="icon-title">Mạng xã hội</h4>
                    </div>
                    <div className="icon-box-content">
                      <div className="socials-footer">
                        <ul className="list-inline">
                          {["facebook", "twitter", "instagram", "linkedin"].map((s) => (
                            <li className="list-inline-item" key={s}>
                              <a href="#" className="link-one" aria-label={s}>
                                <i className={`bi bi-${s}`} aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
