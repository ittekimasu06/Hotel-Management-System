import "dotenv/config";
import path from "node:path";
import { z } from "zod";

const env = z
  .object({
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string().min(16, "SESSION_SECRET phải dài ít nhất 16 ký tự"),
    PORT: z.coerce.number().default(4000),
    UPLOAD_DIR: z.string().default("../public/images"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    SMTP_FROM_NAME: z.string().default("Hostay"),
  })
  .parse(process.env);

const dbUrl = new URL(env.DATABASE_URL);

export const config = {
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET,
  uploadDir: path.resolve(process.cwd(), env.UPLOAD_DIR),
  isProduction: env.NODE_ENV === "production",
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromName: env.SMTP_FROM_NAME,
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },
  db: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
  },
};
