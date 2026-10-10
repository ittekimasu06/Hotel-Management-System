import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { CatalogItem } from "./adminApi";

/** Quản lý danh mục tên + ghi chú (loại phòng, trạng thái đơn), thêm/sửa ngay trên bảng */
export function CatalogPage({ title, endpoint, itemLabel }: { title: string; endpoint: string; itemLabel: string }) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api<CatalogItem[]>(endpoint)
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [endpoint]);

  useEffect(reload, [reload]);

  async function save(e: FormEvent<HTMLFormElement>, id: number | "new") {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = JSON.stringify({ name: String(form.get("name") ?? ""), notes: String(form.get("notes") ?? "") });
    try {
      await api(id === "new" ? endpoint : `${endpoint}/${id}`, { method: id === "new" ? "POST" : "PUT", body });
      setEditing(null);
      setError(null);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(item: CatalogItem) {
    if (!window.confirm(`Xóa ${itemLabel} "${item.name}"?`)) return;
    try {
      await api(`${endpoint}/${item.id}`, { method: "DELETE" });
      setError(null);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const editRow = (id: number | "new", item?: CatalogItem) => (
    <tr key={`edit-${id}`}>
      <td colSpan={4}>
        <form className="row g-2" onSubmit={(e) => save(e, id)}>
          <div className="col-md-4">
            <input name="name" className="form-control form-control-sm" placeholder="Tên" defaultValue={item?.name} required maxLength={45} autoFocus />
          </div>
          <div className="col-md-6">
            <input name="notes" className="form-control form-control-sm" placeholder="Ghi chú" defaultValue={item?.notes ?? ""} maxLength={5000} />
          </div>
          <div className="col-md-2 d-flex gap-1">
            <button className="btn btn-success btn-sm">Lưu</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(null)}>
              Hủy
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">{title}</h1>
        <button className="btn btn-success btn-sm" onClick={() => setEditing("new")} disabled={editing === "new"}>
          <i className="bi bi-plus-lg me-1" />
          Thêm
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {!items && !error && <p>Đang tải...</p>}
      {items && (
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên</th>
              <th>Ghi chú</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {editing === "new" && editRow("new")}
            {items.map((item) =>
              editing === item.id ? (
                editRow(item.id, item)
              ) : (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td className="small text-muted">{item.notes}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-outline-primary btn-sm me-1" onClick={() => setEditing(item.id)}>
                      Sửa
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => remove(item)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
