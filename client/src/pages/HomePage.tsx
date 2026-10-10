import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Destination, type Paged, type Room } from "../api/client";
import { RoomCard } from "../components/RoomCard";

export function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    api<Paged<Room>>("/rooms?pageSize=6")
      .then((r) => setRooms(r.items))
      .catch(() => setRooms([]));
    api<Destination[]>("/rooms/destinations")
      .then(setDestinations)
      .catch(() => setDestinations([]));
  }, []);

  return (
    <>
      <section className="p-5 mb-5 rounded-3 text-white bg-success bg-gradient">
        <h1 className="display-5 fw-bold">Hiện đại · Tinh tế · Sang trọng</h1>
        <p className="lead">Tìm và đặt phòng khách sạn phù hợp cho chuyến đi của bạn.</p>
        <Link to="/rooms" className="btn btn-light btn-lg">
          Đặt phòng ngay
        </Link>
      </section>

      <section className="mb-5">
        <h2 className="h4 mb-3">Địa điểm phổ biến</h2>
        <div className="row g-3">
          {destinations.map((d) => (
            <div className="col-6 col-md-3" key={d.name}>
              <Link to={`/rooms?address=${encodeURIComponent(d.name)}`} className="card text-decoration-none h-100">
                <div className="card-body">
                  <h3 className="h6 mb-1">{d.name}</h3>
                  <span className="text-muted small">{d.count} điểm dừng</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Mới nhất</h2>
          <Link to="/rooms">Xem tất cả</Link>
        </div>
        <div className="row g-4">
          {rooms.map((room) => (
            <div className="col-sm-6 col-lg-4" key={room.id}>
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
