import { Link } from "react-router-dom";
import type { Room } from "../api/client";

export function RoomCard({ room }: { room: Room }) {
  return (
    <div className="card h-100 shadow-sm">
      {room.image && (
        <img src={room.image} className="card-img-top" alt={room.hotelName} style={{ height: 200, objectFit: "cover" }} />
      )}
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`/rooms/${room.id}`} className="text-decoration-none">
            {room.hotelName}
          </Link>
        </h5>
        <p className="card-text text-muted small mb-2">{room.address}</p>
        <p className="mb-1">
          <span className="badge text-bg-light me-1">{room.type?.name}</span>
          <span className="badge text-bg-light">{room.area} m²</span>
        </p>
      </div>
      <div className="card-footer d-flex justify-content-between align-items-center">
        <span className="fw-bold text-success">${room.price}</span>
        <span>
          {room.quality} <i className="bi bi-star-fill text-warning" />
        </span>
      </div>
    </div>
  );
}
