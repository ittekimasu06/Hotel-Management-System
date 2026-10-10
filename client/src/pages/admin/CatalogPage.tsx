import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { CatalogItem } from "./adminApi";
import { actionButtons, DetailRow, Modal, PageCard, PageTitle } from "./ui";

type Dialog = { kind: "view" | "edit" | "delete"; item: CatalogItem } | { kind: "add" } | null;

/**
 * Danh mục tên + ghi chú (loại phòng, trạng thái đơn), chuyển từ admin/roomtypes.php và billstatics.php:
 * bảng với các nút xem/sửa/xóa mở popup, nút "Thêm" mở popup thêm mới.
 */
export function CatalogPage({
  title,
  section,
  endpoint,
  itemLabel,
}: {
  title: string;
  section: string;
  endpoint: string;
  itemLabel: string;
}) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api<CatalogItem[]>(endpoint)
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [endpoint]);

  useEffect(reload, [reload]);

  const close = useCallback(() => {
    setDialog(null);
    setDialogError(null);
  }, []);

  async function save(e: FormEvent<HTMLFormElement>, id?: number) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = JSON.stringify({ name: String(form.get("name") ?? ""), notes: String(form.get("notes") ?? "") });
    try {
      await api(id ? `${endpoint}/${id}` : endpoint, { method: id ? "PUT" : "POST", body });
      close();
      reload();
    } catch (err) {
      setDialogError((err as Error).message);
    }
  }

  async function remove(item: CatalogItem) {
    try {
      await api(`${endpoint}/${item.id}`, { method: "DELETE" });
      close();
      reload();
    } catch (err) {
      setDialogError((err as Error).message);
    }
  }

  const formBody = (item?: CatalogItem) => (
    <>
      {dialogError && <div className="alert alert-danger py-2">{dialogError}</div>}
      <div className="row mt-3">
        <label className="col-sm-12 col-form-label fw-bold" htmlFor="c-name">
          Tên {itemLabel}
        </label>
        <div className="col-sm-12">
          <input type="text" className="form-control" id="c-name" name="name" defaultValue={item?.name} required maxLength={45} autoFocus />
        </div>
      </div>
      <div className="row mt-3">
        <label className="col-sm-12 col-form-label fw-bold" htmlFor="c-notes">
          Ghi chú
        </label>
        <div className="col-sm-12">
          <textarea className="form-control" id="c-notes" name="notes" rows={10} defaultValue={item?.notes ?? ""} maxLength={5000} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <PageTitle title={title} crumbs={[{ label: section }]} />
      <PageCard>
        <div className="row my-3">
          <div className="col-md-12">
            <button className="btn btn-primary" onClick={() => setDialog({ kind: "add" })}>
              <i className="bi bi-plus-circle" /> Thêm {itemLabel}
            </button>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {items && (
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Tên</th>
                <th scope="col">Ghi chú</th>
                <th scope="col" colSpan={3}>
                  Thực hiện
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <th scope="row" className="align-middle">
                    {item.id}
                  </th>
                  <td className="align-middle">{item.name}</td>
                  <td className="align-middle">{item.notes}</td>
                  <td className="align-middle">
                    <button className={actionButtons.view} onClick={() => setDialog({ kind: "view", item })} aria-label="Xem">
                      <i className="bi bi-eye" />
                    </button>
                  </td>
                  <td className="align-middle">
                    <button className={actionButtons.edit} onClick={() => setDialog({ kind: "edit", item })} aria-label="Sửa">
                      <i className="bi bi-pencil-square" />
                    </button>
                  </td>
                  <td className="align-middle">
                    <button className={actionButtons.remove} onClick={() => setDialog({ kind: "delete", item })} aria-label="Xóa">
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PageCard>

      {dialog?.kind === "view" && (
        <Modal title={`Thông tin ${itemLabel}`} onClose={close}>
          <DetailRow label={`Tên ${itemLabel}`}>{dialog.item.name}</DetailRow>
          <DetailRow label="Ghi chú">{dialog.item.notes}</DetailRow>
        </Modal>
      )}

      {(dialog?.kind === "add" || dialog?.kind === "edit") && (
        <form onSubmit={(e) => save(e, dialog.kind === "edit" ? dialog.item.id : undefined)}>
          <Modal
            title={dialog.kind === "add" ? `Thêm ${itemLabel}` : `Sửa ${itemLabel}`}
            onClose={close}
            footer={
              <button type="submit" className="btn btn-primary">
                {dialog.kind === "add" ? "Thêm mới" : "Lưu"}
              </button>
            }
          >
            {formBody(dialog.kind === "edit" ? dialog.item : undefined)}
          </Modal>
        </form>
      )}

      {dialog?.kind === "delete" && (
        <Modal
          title={`Xóa ${itemLabel}`}
          onClose={close}
          footer={
            <button className="btn btn-danger" onClick={() => remove(dialog.item)}>
              Xóa
            </button>
          }
        >
          {dialogError && <div className="alert alert-danger py-2">{dialogError}</div>}
          <p>Bạn có chắc chắn muốn xóa {itemLabel} này:</p>
          <p>
            <b>Tên {itemLabel}: </b>
            {dialog.item.name}
          </p>
        </Modal>
      )}
    </>
  );
}
