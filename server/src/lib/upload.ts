import { randomInt } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { config } from "../config.js";
import { HttpError } from "./http-error.js";

const MAX_SIZE = 5 * 1024 * 1024;

/** Tiền tố đường dẫn ảnh lưu trong DB (ảnh cũ từ bản PHP có dạng "/hostay/public/images/<file>") */
const STORED_PREFIX = "/uploads/";

/** Nhận diện định dạng ảnh qua chữ ký nhị phân, không tin vào đuôi file hay Content-Type */
function detectImage(buf: Buffer): "jpg" | "png" | "gif" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 6 && ["GIF87a", "GIF89a"].includes(buf.subarray(0, 6).toString("ascii"))) return "gif";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

/** Nhận file vào bộ nhớ để kiểm tra nội dung trước khi ghi xuống đĩa */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
});

/**
 * Lưu ảnh đã upload, trả về đường dẫn để ghi vào DB.
 */
export async function saveImage(file: Express.Multer.File): Promise<string> {
  const ext = detectImage(file.buffer);
  if (!ext) {
    throw new HttpError(400, "File không phải ảnh hợp lệ (chỉ nhận JPG, PNG, GIF, WEBP)");
  }
  // Tên file do server sinh ra: <timestamp>_<số ngẫu nhiên>.<đuôi>
  const name = `${Math.floor(Date.now() / 1000)}_${randomInt(10000, 100000)}.${ext}`;
  await fs.mkdir(config.uploadDir, { recursive: true });
  await fs.writeFile(path.join(config.uploadDir, name), file.buffer, { flag: "wx" });
  return STORED_PREFIX + name;
}

/** Xóa ảnh cũ. Chỉ lấy tên file để không thể xóa ra ngoài thư mục upload. */
export async function deleteImage(stored: string | null): Promise<void> {
  if (!stored) return;
  const name = path.basename(stored);
  if (!name || name === "." || name === "..") return;
  await fs.rm(path.join(config.uploadDir, name), { force: true });
}

export { MAX_SIZE as MAX_IMAGE_SIZE };
