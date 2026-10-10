import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { api, type Room } from "../api/client";

const STATUS: Record<number, { label: string; className: string }> = {
  1: { label: "Còn phòng trống", className: "text-success" },
  2: { label: "Hết phòng", className: "text-danger" },
  3: { label: "Đang sửa chữa", className: "text-warning" },
};

export function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Room>(`/rooms/${id}`)
      .then(setRoom)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!room) return <p>Đang tải...</p>;

  const status = room.status != null ? STATUS[room.status] : undefined;

  return (
    <>
      <Link to="/rooms" className="d-inline-block mb-3">
        <i className="bi bi-arrow-left" /> Danh sách phòng
      </Link>
      <h1 className="h3">{room.hotelName}</h1>
      <p className="text-muted">{room.address}</p>

      <div className="row g-4">
        <div className="col-lg-7">
          {room.image && <img src={room.image} alt={room.hotelName} className="img-fluid rounded" />}
        </div>
        <div className="col-lg-5">
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between">
              <span>Giá</span> <b className="text-success">${room.price}</b>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Loại phòng</span> {room.type?.name}
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Loại giường</span> {room.bedType}
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Số giường / người</span> {room.numberBed} / {room.numberPeople}
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Diện tích</span> {room.area} m²
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Đánh giá</span>
              <span>
                {room.quality} <i className="bi bi-star-fill text-warning" />
              </span>
            </li>
            {status && (
              <li className="list-group-item d-flex justify-content-between">
                <span>Trạng thái</span> <span className={status.className}>{status.label}</span>
              </li>
            )}
          </ul>
          {/* TODO (giai đoạn 3): form đặt phòng */}
        </div>
      </div>

      {room.detail && (
        <section className="mt-4">
          <h2 className="h5">Mô tả</h2>
          {/* Mô tả là HTML do admin soạn bằng trình soạn thảo, được làm sạch trước khi hiển thị */}
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(room.detail) }} />
        </section>
      )}
    </>
  );
}
