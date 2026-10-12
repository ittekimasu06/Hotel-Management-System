import fs from "node:fs";
import path from "node:path";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import multer from "multer";
import { ZodError } from "zod";
import { config } from "./config.js";
import { HttpError } from "./lib/http-error.js";
import { sessionMiddleware } from "./lib/session.js";
import { loadUser } from "./middleware/auth.js";
import { csrfGuard } from "./middleware/csrf.js";
import { normalizeUnicode } from "./middleware/normalize.js";
import { adminRouter } from "./routes/admin/index.js";
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { contactsRouter } from "./routes/contacts.js";
import { roomsRouter } from "./routes/rooms.js";
import { roomTypesRouter } from "./routes/room-types.js";

export const app = express();

app.disable("x-powered-by");
if (config.isProduction) {
  // Chạy sau reverse proxy (nginx, Render...) để cookie secure và rate limit nhận đúng IP
  app.set("trust proxy", 1);
}
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Bản đồ Google nhúng trong trang chi tiết phòng
        "frame-src": ["'self'", "https://maps.google.com", "https://www.google.com"],
        // blob: cho ảnh xem trước khi chọn file ở form phòng
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
  }),
);

// Ảnh phòng do admin upload
app.use("/uploads", express.static(config.uploadDir, { fallthrough: false }));

const api = express.Router();
api.use(express.json({ limit: "100kb" }));
api.use(normalizeUnicode);
api.use(sessionMiddleware);
// Chỉ route quản lý phòng được nhận multipart (upload ảnh)
api.use(csrfGuard(["/admin/rooms"]));
api.use(loadUser);

api.get("/health", (_req, res) => {
  res.json({ ok: true });
});
api.use("/auth", authRouter);
api.use("/rooms", roomsRouter);
api.use("/room-types", roomTypesRouter);
api.use("/bookings", bookingsRouter);
api.use("/contacts", contactsRouter);
api.use("/admin", adminRouter);

api.use((_req, _res, next) => {
  next(new HttpError(404, "Không tìm thấy API"));
});

app.use("/api", api);

// Bản build React: phục vụ file tĩnh; mọi đường dẫn còn lại trả index.html để React Router xử lý
const indexHtml = path.join(config.clientDist, "index.html");
if (fs.existsSync(indexHtml)) {
  app.use(
    express.static(config.clientDist, {
      index: false,
      setHeaders(res, file) {
        // File trong assets/ có mã hash trong tên, cache lâu dài an toàn
        if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );
  app.get("/{*splat}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexHtml);
  });
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Dữ liệu không hợp lệ", details: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Ảnh vượt quá 5MB" : "Upload không hợp lệ";
    res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: message });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON không hợp lệ" });
    return;
  }
  // Lỗi 4xx từ thư viện (vd: express.static trả 404 khi thiếu file, 403 khi đường dẫn không hợp lệ)
  if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: err.status === 404 ? "Không tìm thấy" : "Yêu cầu không hợp lệ" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ" });
};
app.use(errorHandler);
