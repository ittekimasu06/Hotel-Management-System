import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type Paged, type Room, type RoomType } from "../api/client";
import { RoomCard } from "../components/RoomCard";

export function RoomsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paged<Room> | null>(null);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<RoomType[]>("/room-types").then(setTypes).catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    setError(null);
    api<Paged<Room>>(`/rooms?${params.toString()}`)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [params]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    for (const [k, v] of form) {
      if (typeof v === "string" && v.trim() !== "") next.set(k, v.trim());
    }
    setParams(next);
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <h1 className="h3 mb-3">Danh sách phòng</h1>

      <form className="row g-2 mb-4" onSubmit={onSearch}>
        <div className="col-md-4">
          <input name="key" className="form-control" placeholder="Khách sạn, địa chỉ, loại giường..." defaultValue={params.get("key") ?? ""} />
        </div>
        <div className="col-md-3">
          <select name="type" className="form-select" defaultValue={params.get("type") ?? ""}>
            <option value="">Tất cả loại phòng</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select name="sort" className="form-select" defaultValue={params.get("sort") ?? "newest"}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-success">
            <i className="bi bi-search me-1" /> Tìm
          </button>
        </div>
      </form>

      {params.get("address") && (
        <p>
          Địa điểm: <span className="badge text-bg-success">{params.get("address")}</span>{" "}
          <button
            className="btn btn-link btn-sm p-0 align-baseline"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("address");
              next.delete("page");
              setParams(next);
            }}
          >
            Bỏ lọc
          </button>
        </p>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p>Đang tải...</p>}
      {data && data.items.length === 0 && <p>Không tìm thấy phòng phù hợp.</p>}

      <div className="row g-4">
        {data?.items.map((room) => (
          <div className="col-sm-6 col-lg-4" key={room.id}>
            <RoomCard room={room} />
          </div>
        ))}
      </div>

      {data && totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === data.page ? "active" : ""}`}>
                <button className="page-link" onClick={() => goToPage(p)}>
                  {p}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
