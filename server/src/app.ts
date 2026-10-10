import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { config } from "./config.js";
import { HttpError } from "./lib/http-error.js";
import { sessionMiddleware } from "./lib/session.js";
import { loadUser } from "./middleware/auth.js";
import { csrfGuard } from "./middleware/csrf.js";
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
app.use(helmet());

// Ảnh phòng dùng chung thư mục với bản PHP
app.use("/uploads", express.static(config.uploadDir, { fallthrough: false }));

const api = express.Router();
api.use(express.json({ limit: "100kb" }));
api.use(sessionMiddleware);
api.use(csrfGuard());
api.use(loadUser);

api.get("/health", (_req, res) => {
  res.json({ ok: true });
});
api.use("/auth", authRouter);
api.use("/rooms", roomsRouter);
api.use("/room-types", roomTypesRouter);
api.use("/bookings", bookingsRouter);
api.use("/contacts", contactsRouter);

api.use((_req, _res, next) => {
  next(new HttpError(404, "Không tìm thấy API"));
});

app.use("/api", api);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Dữ liệu không hợp lệ", details: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON không hợp lệ" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ" });
};
app.use(errorHandler);
