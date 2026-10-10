import "dotenv/config";
import path from "node:path";
import { z } from "zod";

const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(16, "SESSION_SECRET phải dài ít nhất 16 ký tự"),
    PORT: z.coerce.number().default(4000),
    UPLOAD_DIR: z.string().default("../public/images"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  })
  .parse(process.env);

export const config = {
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET,
  uploadDir: path.resolve(process.cwd(), env.UPLOAD_DIR),
  isProduction: env.NODE_ENV === "production",
};
