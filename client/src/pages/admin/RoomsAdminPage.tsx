import { useState } from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { api, type Room } from "../../api/client";
import { Pagination } from "../../components/Pagination";
import { useAdminList } from "./useAdminList";
import { actionButtons, DetailRow, Modal, PageCard, PageTitle } from "./ui";

const STATUS: Record<number, { label: string; className: string }> = {
  1: { label: "Còn phòng trống", className: "text-success" },
  2: { label: "Hết phòng", className: "text-danger" },
  3: { label: "Đang sửa chữa", className: "text-warning" },
};

function RoomStatus({ status }: { status: number | null }) {
  const s = status != null ? STATUS[status] : undefined;
  return s ? <span className={s.className}>{s.label}</span> : null;
}

/** Danh sách phòng, chuyển từ admin/rooms.php */
export function RoomsAdminPage() {
  const { data, error, setError, reload, params, setPage } = useAdminList<Room>("/admin/rooms");
  const [viewing, setViewing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  async function remove(room: Room) {
    try {
      await api(`/admin/rooms/${room.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageTitle title="Danh sách" crumbs={[{ label: "Phòng" }]} />
      <PageCard>
        <div className="row my-3">
          <div className="col-md-12">
            <Link to="/admin/rooms/new" className="btn btn-primary">
              <i className="bi bi-plus-circle" /> Thêm phòng
            </Link>
          </div>
        </div>
        {params.get("key") && <p className="small text-muted">Kết quả tìm kiếm cho “{params.get("key")}”</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {data && (
          <>
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Kiểu phòng</th>
                  <th scope="col">Khách sạn</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col" colSpan={3}>
                    Thực hiện
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="align-middle">
                      {r.id}
                    </th>
                    <td className="align-middle">{r.type?.name}</td>
                    <td className="align-middle">{r.hotelName}</td>
                    <td className="align-middle">
                      <RoomStatus status={r.status} />
                    </td>
                    <td className="align-middle">
                      <button className={actionButtons.view} onClick={() => setViewing(r)} aria-label="Xem">
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                    <td className="align-middle">
                      <Link className={actionButtons.edit} to={`/admin/rooms/${r.id}`} aria-label="Sửa">
                        <i className="bi bi-pencil-square" />
                      </Link>
                    </td>
                    <td className="align-middle">
                      <button className={actionButtons.remove} onClick={() => setDeleting(r)} aria-label="Xóa">
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>Không có dữ liệu!</p>}
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </>
        )}
      </PageCard>

      {viewing && (
        <Modal title="Thông tin phòng" size="lg" onClose={() => setViewing(null)}>
          {viewing.image && (
            <div className="row">
              <div className="col-sm-12 d-flex justify-content-center">
                <img src={viewing.image} alt={viewing.hotelName} className="img-fluid rounded" />
              </div>
            </div>
          )}
          <DetailRow label="Tên khách sạn">{viewing.hotelName}</DetailRow>
          <DetailRow label="Địa chỉ">{viewing.address}</DetailRow>
          <DetailRow label="Loại phòng">{viewing.type?.name}</DetailRow>
          <DetailRow label="Loại giường">{viewing.bedType}</DetailRow>
          <DetailRow label="Số người">{viewing.numberPeople}</DetailRow>
          <DetailRow label="Số giường">{viewing.numberBed}</DetailRow>
          <DetailRow label="Đánh giá">
            {viewing.quality} <i className="bi bi-star-fill text-warning" />
          </DetailRow>
          <DetailRow label="Giá">{viewing.price.toFixed(2)}</DetailRow>
          <DetailRow label="Diện tích">
            {viewing.area}m<sup>2</sup>
          </DetailRow>
          <DetailRow label="Trạng thái">
            <RoomStatus status={viewing.status} />
          </DetailRow>
          <div className="row mt-3">
            <div className="col-sm-12 fw-bold">Mô tả:</div>
            <div className="col-sm-12" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewing.detail ?? "") }} />
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Xóa phòng"
          onClose={() => setDeleting(null)}
          footer={
            <button className="btn btn-danger" onClick={() => remove(deleting)}>
              Xóa
            </button>
          }
        >
          <p>Bạn có chắc chắn muốn xóa phòng này:</p>
          <p>
            <b>Khách sạn: </b>
            {deleting.hotelName}
          </p>
          <p>
            <b>Loại: </b>
            {deleting.type?.name}
          </p>
        </Modal>
      )}
    </>
  );
}
