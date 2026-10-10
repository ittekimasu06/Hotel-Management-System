import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";

export const contactsRouter = Router();

// Form công khai, giới hạn để chống spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Bạn đã gửi quá nhiều phản hồi, vui lòng thử lại sau" },
});

const createBody = z.object({
  fullname: z.string().trim().min(1, "Hãy nhập họ tên").max(100),
  email: z.string().trim().email("Email không hợp lệ").max(100),
  subject: z.string().trim().min(1, "Hãy nhập tiêu đề").max(200),
  notes: z.string().trim().min(1, "Hãy nhập nội dung").max(5000),
});

contactsRouter.post("/", contactLimiter, async (req, res) => {
  const body = createBody.parse(req.body);
  await prisma.contact.create({
    data: { ...body, seen: 0, createdAt: new Date() },
  });
  res.status(201).json({ ok: true });
});
