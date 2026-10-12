import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

const env = z
  .object({
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string().min(16, "SESSION_SECRET phải dài ít nhất 16 ký tự"),
    PORT: z.coerce.number().default(4000),
    UPLOAD_DIR: z.string().default("uploads"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Chứng chỉ CA để kết nối MySQL qua SSL (bắt buộc với MySQL trên cloud như Aiven).
    // Nhận nội dung PEM (dán thẳng vào biến môi trường) hoặc đường dẫn tới file .pem; để trống = không dùng SSL.
    DB_SSL_CA: z.string().default(""),
    // Thư mục bản build của React; nếu tồn tại, Express phục vụ luôn giao diện
    CLIENT_DIST: z.string().default("../client/dist"),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    SMTP_FROM_NAME: z.string().default("Hostay"),
  })
  .parse(process.env);

/** Đọc CA: nội dung PEM (chấp nhận "\n" viết dạng chữ) hoặc đường dẫn file */
function loadCa(value: string): string | null {
  if (!value) return null;
  if (value.includes("-----BEGIN")) return value.replace(/\\n/g, "\n");
  return fs.readFileSync(path.resolve(process.cwd(), value), "utf8");
}

const ca = loadCa(env.DB_SSL_CA);
const dbUrl = new URL(env.DATABASE_URL);

/**
 * URL cho Prisma. Bỏ tham số "ssl-mode" mà nhà cung cấp hay gắn sẵn (Prisma không dùng),
 * và khi có CA thì ghi CA ra file tạm rồi bật kiểm tra chứng chỉ chặt chẽ.
 */
function prismaUrl(): string {
  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete("ssl-mode");
  url.searchParams.delete("sslmode");
  if (ca) {
    const caFile = path.join(os.tmpdir(), "hostay-db-ca.pem");
    fs.writeFileSync(caFile, ca);
    url.searchParams.set("sslcert", caFile);
    url.searchParams.set("sslaccept", "strict");
  }
  return url.toString();
}

export const config = {
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET,
  uploadDir: path.resolve(process.cwd(), env.UPLOAD_DIR),
  clientDist: path.resolve(process.cwd(), env.CLIENT_DIST),
  isProduction: env.NODE_ENV === "production",
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromName: env.SMTP_FROM_NAME,
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },
  prismaUrl: prismaUrl(),
  db: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
    ssl: ca ? { ca, rejectUnauthorized: true } : undefined,
  },
};
