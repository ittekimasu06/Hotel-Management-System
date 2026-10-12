import { PrismaClient } from "@prisma/client";
import { config } from "./config.js";

// URL lấy từ config (đã thêm tham số SSL khi có DB_SSL_CA) thay vì đọc thẳng DATABASE_URL
export const prisma = new PrismaClient({ datasources: { db: { url: config.prismaUrl } } });
