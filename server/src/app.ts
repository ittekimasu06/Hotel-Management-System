import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import helmet from "helmet";
import { ZodError } from "zod";
import { config } from "./config.js";
import { HttpError } from "./lib/http-error.js";
import { roomsRouter } from "./routes/rooms.js";
import { roomTypesRouter } from "./routes/room-types.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// TODO (giai đoạn 2): thay MemoryStore mặc định bằng store lưu trong MySQL trước khi deploy
app.use(
  session({
    name: "hostay.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// Ảnh phòng dùng chung thư mục với bản PHP
app.use("/uploads", express.static(config.uploadDir, { fallthrough: false }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/rooms", roomsRouter);
app.use("/api/room-types", roomTypesRouter);

app.use("/api", (_req, _res, next) => {
  next(new HttpError(404, "Không tìm thấy API"));
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Dữ liệu không hợp lệ", details: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ" });
};
app.use(errorHandler);
