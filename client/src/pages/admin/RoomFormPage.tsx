import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type Room, type RoomType } from "../../api/client";
import { ROOM_STATUS } from "./adminApi";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Trang thêm phòng (/admin/rooms/new) và sửa phòng (/admin/rooms/:id) */
export function RoomFormPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<RoomType[]>("/admin/room-types").then(setTypes).catch((e: Error) => setError(e.message));
    if (!isNew) {
      api<Room>(`/admin/rooms/${id}`)
        .then((r) => {
          setRoom(r);
          setPreview(r.image);
        })
        .catch((e: Error) => setError(e.message));
    }
  }, [id, isNew]);

  // Giải phóng URL tạm của ảnh xem trước
  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("image");
    if (file instanceof File && file.size === 0) form.delete("image");
    if (file instanceof File && file.size > MAX_IMAGE_SIZE) {
      setError("Ảnh vượt quá 5MB");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api<Room>(isNew ? "/admin/rooms" : `/admin/rooms/${id}`, { method: isNew ? "POST" : "PUT", body: form });
      navigate("/admin/rooms");
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (!isNew && !room && !error) return <p>Đang tải...</p>;

  return (
    <>
      <Link to="/admin/rooms" className="small">
        <i className="bi bi-arrow-left" /> Danh sách phòng
      </Link>
      <h1 className="h4 my-3">{isNew ? "Thêm phòng" : `Sửa phòng #${id}`}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-md-4">
          <label className="form-label" htmlFor="r-image">
            Ảnh {isNew ? "" : "(để trống nếu giữ ảnh cũ)"}
          </label>
          {preview && <img src={preview} alt="" className="img-fluid rounded mb-2" />}
          <input
            id="r-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="form-control"
            required={isNew}
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : room?.image ?? null);
            }}
          />
          <div className="form-text">JPG, PNG, GIF hoặc WEBP, tối đa 5MB.</div>
        </div>

        <div className="col-md-8">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="r-hotel">
                Tên khách sạn
              </label>
              <input id="r-hotel" name="hotelName" className="form-control" defaultValue={room?.hotelName} required maxLength={100} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="r-type">
                Loại phòng
              </label>
              <select id="r-type" name="typeId" className="form-select" defaultValue={room?.type?.id ?? ""} required key={types.length}>
                <option value="" disabled>
                  Chọn loại phòng
                </option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="r-address">
                Địa chỉ
              </label>
              <input id="r-address" name="address" className="form-control" defaultValue={room?.address} required maxLength={200} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="r-bed">
                Loại giường
              </label>
              <input id="r-bed" name="bedType" className="form-control" defaultValue={room?.bedType ?? ""} required maxLength={100} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="r-status">
                Trạng thái
              </label>
              <select id="r-status" name="status" className="form-select" defaultValue={room?.status ?? 1}>
                {Object.entries(ROOM_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label" htmlFor="r-people">
                Số người
              </label>
              <input id="r-people" name="numberPeople" type="number" min={1} max={10} className="form-control" defaultValue={room?.numberPeople ?? 2} required />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label" htmlFor="r-beds">
                Số giường
              </label>
              <input id="r-beds" name="numberBed" type="number" min={1} max={10} className="form-control" defaultValue={room?.numberBed ?? 1} required />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label" htmlFor="r-quality">
                Đánh giá (1–5)
              </label>
              <input id="r-quality" name="quality" type="number" min={1} max={5} step={0.1} className="form-control" defaultValue={room?.quality ?? 4} required />
            </div>
            <div className="col-6 col-md-6">
              <label className="form-label" htmlFor="r-price">
                Giá / đêm ($)
              </label>
              <input id="r-price" name="price" type="number" min={0} step={0.01} className="form-control" defaultValue={room?.price} required />
            </div>
            <div className="col-6 col-md-6">
              <label className="form-label" htmlFor="r-area">
                Diện tích (m²)
              </label>
              <input id="r-area" name="area" type="number" min={0} step={0.1} className="form-control" defaultValue={room?.area} required />
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="r-detail">
            Mô tả (cho phép HTML cơ bản như &lt;p&gt;, &lt;br&gt;, &lt;b&gt;)
          </label>
          <textarea id="r-detail" name="detail" className="form-control font-monospace small" rows={8} defaultValue={room?.detail ?? ""} maxLength={20000} />
        </div>

        <div className="col-12">
          <button className="btn btn-success" disabled={saving}>
            {saving ? "Đang lưu..." : isNew ? "Thêm phòng" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </>
  );
}
