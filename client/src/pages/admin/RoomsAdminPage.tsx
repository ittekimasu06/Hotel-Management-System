import { Link } from "react-router-dom";
import { api, type Room } from "../../api/client";
import { Pagination } from "../../components/Pagination";
import { money, ROOM_STATUS } from "./adminApi";
import { useAdminList } from "./useAdminList";

export function RoomsAdminPage() {
  const { data, error, setError, reload, params, setFilter, setPage } = useAdminList<Room>("/admin/rooms");

  async function remove(room: Room) {
    if (!window.confirm(`Xóa phòng #${room.id} - ${room.hotelName}?`)) return;
    try {
      await api(`/admin/rooms/${room.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Phòng</h1>
        <Link to="/admin/rooms/new" className="btn btn-success btn-sm">
          <i className="bi bi-plus-lg me-1" />
          Thêm phòng
        </Link>
      </div>

      <form
        className="mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter("key", String(new FormData(e.currentTarget).get("key") ?? "").trim());
        }}
      >
        <input name="key" className="form-control form-control-sm" placeholder="Tìm theo tên khách sạn hoặc địa chỉ" defaultValue={params.get("key") ?? ""} />
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <p>Đang tải...</p>}

      {data && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Khách sạn</th>
                <th>Loại</th>
                <th className="text-end">Giá</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.image && <img src={r.image} alt="" width={64} height={40} style={{ objectFit: "cover" }} className="rounded" />}</td>
                  <td>
                    {r.hotelName}
                    <div className="small text-muted">{r.address}</div>
                  </td>
                  <td>{r.type?.name}</td>
                  <td className="text-end">{money(r.price)}</td>
                  <td>{r.status != null ? ROOM_STATUS[r.status] ?? "—" : "—"}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/rooms/${r.id}`} className="btn btn-outline-primary btn-sm me-1">
                      Sửa
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => remove(r)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="text-muted">Không có phòng nào.</p>}
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
        </div>
      )}
    </>
  );
}
