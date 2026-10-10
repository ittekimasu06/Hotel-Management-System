import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Chống CSRF cho API dùng cookie session:
 * - Cookie có SameSite=Lax nên trình duyệt không gửi kèm trong request POST từ site khác.
 * - Thêm lớp thứ hai: request thay đổi dữ liệu phải là JSON. Form HTML từ site khác không gửi được
 *   Content-Type application/json nếu không qua CORS preflight (mà server không cho phép).
 *   Route upload file (multipart) cần được liệt kê trong `allowMultipart`.
 */
export function csrfGuard(allowMultipart: string[] = []): RequestHandler {
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    // Đọc header trực tiếp: req.is() trả về null khi request không có body
    const type = (req.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
    if (type === "application/json") {
      next();
      return;
    }
    if (type === "multipart/form-data" && allowMultipart.some((p) => req.path.startsWith(p))) {
      next();
      return;
    }
    // Request không có body (ví dụ DELETE, POST /logout) vẫn phải khai báo JSON
    throw new HttpError(415, "Request phải có Content-Type: application/json");
  };
}
