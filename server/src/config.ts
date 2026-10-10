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
  })
  .parse(process.env);

const dbUrl = new URL(env.DATABASE_URL);

export const config = {
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET,
  uploadDir: path.resolve(process.cwd(), env.UPLOAD_DIR),
  isProduction: env.NODE_ENV === "production",
  db: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
  },
};
