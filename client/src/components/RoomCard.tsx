import { Link } from "react-router-dom";
import type { Room } from "../api/client";

/** Thẻ phòng có ảnh nền và lớp phủ thông tin (RoomBox trong views/components/RoomLibrary.php) */
export function RoomCard({ room, detailLabel = "Click để xem" }: { room: Room; detailLabel?: string }) {
  const href = `/rooms/${room.id}`;
  return (
    <div className="card-box-a card-shadow">
      <div className="img-box-a">{room.image && <img src={room.image} alt={room.hotelName} className="img-a img-fluid" />}</div>
      <div className="card-overlay">
        <div className="card-overlay-a-content">
          <div className="card-header-a">
            <h2 className="card-title-a">
              <Link to={href}>{room.type?.name ?? room.hotelName}</Link>
            </h2>
          </div>
          <div className="card-body-a">
            <div className="price-box d-flex">
              <span className="price-a">Giá | $ {room.price.toFixed(2)}</span>
            </div>
            <Link to={href} className="link-a">
              {detailLabel}
              <span className="bi bi-chevron-right" />
            </Link>
          </div>
          <div className="card-footer-a">
            <ul className="card-info d-flex justify-content-around">
              <li>
                <h4 className="card-info-title">Area</h4>
                <span>
                  {room.area}m<sup>2</sup>
                </span>
              </li>
              <li>
                <h4 className="card-info-title">Beds</h4>
                <span>{room.numberBed}</span>
              </li>
              <li>
                <h4 className="card-info-title">People</h4>
                <span>{room.numberPeople}</span>
              </li>
              <li>
                <h4 className="card-info-title">Quality</h4>
                <span>
                  {room.quality}
                  <i className="bi bi-star-fill text-warning ms-1" />
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
