import type { RequestHandler } from "express";

/**
 * Chuẩn hóa mọi chuỗi trong body và query về Unicode NFC.
 * Tiếng Việt có thể được gõ ở dạng dựng sẵn (NFC) hoặc tổ hợp (NFD); hai dạng trông giống nhau
 * nhưng khác byte, nên nếu lưu lẫn lộn thì tìm kiếm LIKE sẽ không khớp.
 */
function normalize(value: unknown): unknown {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)]));
  }
  return value;
}

export const normalizeUnicode: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = normalize(req.body);
  // Express 5: req.query là getter, thay bằng bản đã chuẩn hóa
  const query = normalize(req.query);
  Object.defineProperty(req, "query", { value: query, writable: true, configurable: true });
  next();
};
