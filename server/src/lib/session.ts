import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { config } from "../config.js";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const MySQLStore = MySQLStoreFactory(session);

// Lưu session trong bảng `sessions` (tự tạo nếu chưa có) để không mất đăng nhập khi restart server
export const sessionStore = new MySQLStore({
  ...config.db,
  createDatabaseTable: true,
  clearExpired: true,
});

export const sessionMiddleware = session({
  name: "hostay.sid",
  secret: config.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
