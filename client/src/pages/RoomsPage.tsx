import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type Paged, type Room } from "../api/client";
import { IntroSingle } from "../components/IntroSingle";
import { RoomCard } from "../components/RoomCard";
import { SitePagination } from "../components/SitePagination";

/** Danh sách phòng, chuyển từ views/rooms.php. Bộ lọc nhập ở hộp "Tìm kiếm phòng" trên thanh điều hướng. */
export function RoomsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paged<Room> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const query = new URLSearchParams(params);
    if (!query.has("pageSize")) query.set("pageSize", "6");
    api<Paged<Room>>(`/rooms?${query}`)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [params]);

  const filters = [
    params.get("key") && `Từ khóa: ${params.get("key")}`,
    params.get("address") && `Địa điểm: ${params.get("address")}`,
    params.get("maxPrice") && `Giá dưới $${params.get("maxPrice")}`,
  ].filter(Boolean);

  function goToPage(page: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
    window.scrollTo(0, 0);
  }

  return (
    <main id="main">
      <IntroSingle title="Dịch vụ của chúng tôi" subtitle="Danh sách phòng" crumbs={[{ label: "Đặt phòng" }]} />

      <section className="property-grid grid">
        <div className="container">
          {filters.length > 0 && (
            <p className="color-text-a">
              {filters.join(" · ")}{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setParams(new URLSearchParams());
                }}
              >
                Bỏ lọc
              </a>
            </p>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          {data && (
            <div className="row">
              {data.items.length > 0 ? (
                data.items.map((room) => (
                  <div className="col-md-4" key={room.id}>
                    <RoomCard room={room} />
                  </div>
                ))
              ) : (
                <div className="col-sm-12">Không tìm được dữ liệu!</div>
              )}
            </div>
          )}
          {data && <SitePagination page={data.page} totalPages={Math.ceil(data.total / data.pageSize)} onChange={goToPage} />}
        </div>
      </section>
    </main>
  );
}
