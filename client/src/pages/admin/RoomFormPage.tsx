import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Room, type RoomType } from "../../api/client";
import { ROOM_STATUS } from "./adminApi";
import { PageCard, PageTitle } from "./ui";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Dòng form kiểu admin/addroom.php: nhãn 2 cột, ô nhập 10 cột */
function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="mb-3 row">
      <label htmlFor={id} className="col-sm-2 col-form-label fw-bold">
        {label}
      </label>
      <div className="col-sm-10">{children}</div>
    </div>
  );
}

/** Thêm phòng (/admin/rooms/new) và sửa phòng (/admin/rooms/:id), chuyển từ admin/addroom.php, editroom.php */
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
    setRoom(null);
    setPreview(null);
    setError(null);
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
  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("image");
    if (file instanceof File && file.size === 0) form.delete("image");
    if (isNew && !(file instanceof File && file.size > 0)) {
      setError("Hãy chọn ảnh cho phòng");
      return;
    }
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

  if (!isNew && !room) return error ? <div className="alert alert-danger">{error}</div> : null;

  return (
    <>
      <PageTitle title={isNew ? "Thêm mới phòng" : "Chỉnh sửa phòng"} crumbs={[{ label: "Phòng", to: "/admin/rooms" }, { label: isNew ? "Thêm mới" : `Phòng #${id}` }]} />
      <PageCard>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <form onSubmit={onSubmit} key={id}>
          <div className="row mt-3 mb-3">
            <label className="col-form-label fw-bold">Ảnh hiển thị {isNew ? "" : "(chọn ảnh mới nếu muốn thay)"}</label>
            {/* Khung bấm để chọn ảnh, style .btn-uploaded của template cũ */}
            <label htmlFor="roomImage" className="btn-uploaded">
              {preview && <img src={preview} className="img-uploaded" alt="" />}
            </label>
            <input
              type="file"
              id="roomImage"
              name="image"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="form-control upload-img-input"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : (room?.image ?? null));
              }}
            />
            <div className="form-text">JPG, PNG, GIF hoặc WEBP, tối đa 5MB.</div>
          </div>

          <Field id="hotelName" label="Tên khách sạn">
            <input type="text" className="form-control" id="hotelName" name="hotelName" placeholder="Hotel name" defaultValue={room?.hotelName} required maxLength={100} />
          </Field>
          <Field id="address" label="Địa chỉ">
            <input type="text" className="form-control" id="address" name="address" placeholder="Address" defaultValue={room?.address} required maxLength={200} />
          </Field>
          <Field id="roomType" label="Loại phòng">
            <select id="roomType" name="typeId" className="form-control" defaultValue={room?.type?.id ?? types[0]?.id} required key={types.length}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="bedType" label="Loại giường">
            <input type="text" className="form-control" id="bedType" name="bedType" placeholder="Bed type" defaultValue={room?.bedType ?? ""} required maxLength={100} />
          </Field>
          <Field id="numberPeople" label="Số người">
            <input type="number" className="form-control" id="numberPeople" name="numberPeople" min={1} max={10} defaultValue={room?.numberPeople ?? 2} required />
          </Field>
          <Field id="numberBed" label="Số giường">
            <input type="number" className="form-control" id="numberBed" name="numberBed" min={1} max={10} defaultValue={room?.numberBed ?? 1} required />
          </Field>
          <Field id="quality" label="Đánh giá">
            <input type="number" className="form-control" id="quality" name="quality" min={1} max={5} step={0.1} defaultValue={room?.quality ?? 4} required />
          </Field>
          <Field id="price" label="Giá ($)">
            <input type="number" className="form-control" id="price" name="price" min={0} step={0.01} defaultValue={room?.price} placeholder="Price" required />
          </Field>
          <Field id="area" label={"Diện tích (m²)"}>
            <input type="number" className="form-control" id="area" name="area" min={0} step={0.1} defaultValue={room?.area} placeholder="Area" required />
          </Field>
          <Field id="status" label="Trạng thái">
            <select id="status" name="status" className="form-control" defaultValue={room?.status ?? 1}>
              {Object.entries(ROOM_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="detail" label="Mô tả">
            <textarea className="form-control" id="detail" name="detail" rows={10} placeholder="Description (cho phép HTML cơ bản)" defaultValue={room?.detail ?? ""} maxLength={20000} />
          </Field>

          <div className="text-center mb-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : isNew ? "Thêm mới" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </PageCard>
    </>
  );
}
