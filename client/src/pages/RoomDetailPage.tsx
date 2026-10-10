import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { api, type Room } from "../api/client";
import { BookingForm } from "../components/BookingForm";
import { IntroSingle } from "../components/IntroSingle";

const STATUS: Record<number, { label: string; className: string }> = {
  1: { label: "Còn phòng trống", className: "text-success" },
  2: { label: "Hết phòng", className: "text-danger" },
  3: { label: "Đang sửa chữa", className: "text-warning" },
};

/** Chi tiết phòng và form đặt phòng, chuyển từ views/room.php */
export function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRoom(null);
    api<Room>(`/rooms/${id}`)
      .then(setRoom)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <main id="main">
        <IntroSingle title="Không tìm thấy phòng" crumbs={[{ label: "Đặt phòng", to: "/rooms" }, { label: "Chi tiết" }]} />
        <div className="container mb-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </main>
    );
  }
  if (!room) return <main id="main" className="intro-single" />;

  const status = room.status != null ? STATUS[room.status] : undefined;

  return (
    <main id="main">
      <IntroSingle title={room.hotelName} subtitle={room.address} crumbs={[{ label: "Đặt phòng", to: "/rooms" }, { label: room.hotelName }]} />

      <section className="property-single nav-arrow-b">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 mb-5">{room.image && <img src={room.image} alt={room.hotelName} className="img-fluid" />}</div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="row justify-content-between">
                <div className="col-md-5 col-lg-4">
                  <div className="property-price d-flex justify-content-center foo">
                    <div className="card-header-c d-flex">
                      <div className="card-box-ico">
                        <span className="bi bi-cash">$</span>
                      </div>
                      <div className="card-title-c align-self-center">
                        <h5 className="title-c">{room.price.toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                  <div className="property-summary">
                    <div className="row">
                      <div className="col-sm-12">
                        <div className="title-box-d section-t4">
                          <h3 className="title-d">Tóm tắt</h3>
                        </div>
                      </div>
                    </div>
                    <div className="summary-list">
                      <ul className="list">
                        <li className="d-flex">
                          <strong className="me-2">ID:</strong>
                          <span>{room.id}</span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Địa chỉ:</strong>
                          <span>{room.address}</span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Loại:</strong>
                          <span>{room.type?.name}</span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Loại giường ngủ:</strong>
                          <span>{room.bedType}</span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Trạng thái:</strong>
                          {status && <span className={status.className}>{status.label}</span>}
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Diện tích:</strong>
                          <span>
                            {room.area}m<sup>2</sup>
                          </span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Giường ngủ:</strong>
                          <span>{room.numberBed}</span>
                        </li>
                        <li className="d-flex">
                          <strong className="me-2">Đánh giá:</strong>
                          <span>
                            {room.quality}
                            <i className="bi bi-star-fill text-warning ms-1" />
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-7 col-lg-7 section-md-t3">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="title-box-d">
                        <h3 className="title-d">Mô tả</h3>
                      </div>
                    </div>
                  </div>
                  <div className="property-description">
                    {/* Mô tả là HTML do admin soạn, được làm sạch trước khi hiển thị */}
                    <div className="description color-text-a" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(room.detail ?? "") }} />
                  </div>
                  <div className="row section-t3">
                    <div className="col-sm-12">
                      <div className="title-box-d">
                        <h3 className="title-d">Tiện nghi</h3>
                      </div>
                    </div>
                  </div>
                  <div className="amenities-list color-text-a">
                    <ul className="list-a no-margin">
                      <li>Wifi miễn phí</li>
                      <li>Chỗ để xe miễn phí</li>
                      <li>Dịch vụ phòng</li>
                      <li>Điều hòa không khí</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-10 offset-md-1">
              <ul className="nav nav-pills-a nav-pills mb-3 section-t3" role="tablist">
                <li className="nav-item">
                  <span className="nav-link active" role="tab" aria-selected="true">
                    <i className="bi bi-geo-alt me-1" />
                    Bản đồ
                  </span>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane show active" role="tabpanel">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(room.address)}&output=embed`}
                    width="100%"
                    height="460"
                    loading="lazy"
                    allowFullScreen
                    title={room.address}
                    style={{ border: 0 }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="row section-t3">
                <div className="col-sm-12">
                  <div className="title-box-d">
                    <h3 className="title-d">Đăng ký đặt phòng</h3>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <div className="property-contact">
                    <BookingForm room={room} />
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
