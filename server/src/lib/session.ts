import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import mysql from "mysql2";
import { config } from "../config.js";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const MySQLStore = MySQLStoreFactory(session);

// Lưu session trong bảng `sessions` (tự tạo nếu chưa có) để không mất đăng nhập khi restart server
// Tự tạo pool để truyền được cấu hình SSL (thư viện lọc bỏ khóa "ssl" nếu đưa qua options)
const pool = mysql.createPool({ ...config.db, connectionLimit: 5 });

export const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    clearExpired: true,
    // Pool do mình tạo nên phải tự đóng khi store đóng
    endConnectionOnClose: true,
  },
  pool,
);

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
