import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import { HttpError } from "../lib/http-error.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { Permission, requireAuth, toAuthUser } from "../middleware/auth.js";

export const authRouter = Router();

// Giới hạn đăng nhập/đăng ký để chống dò mật khẩu
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Chỉ đếm các lần thất bại, người dùng đăng nhập đúng không bị khóa
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Bạn thử quá nhiều lần, vui lòng thử lại sau 15 phút" },
});

// bcrypt chỉ dùng 72 byte đầu của mật khẩu
const password = z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(72, "Mật khẩu quá dài");

const registerBody = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(45)
      .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập chỉ gồm chữ, số, dấu _ và ."),
    password,
    confirmPassword: z.string(),
    fullname: z.string().trim().min(1, "Hãy nhập họ tên").max(100),
    email: z.string().trim().email("Email không hợp lệ").max(45),
    phone: z.string().trim().max(20).optional(),
  })
  .refine((b) => b.password === b.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

const loginBody = z.object({
  username: z.string().trim().min(1).max(45),
  password: z.string().min(1).max(200),
});

const changePasswordBody = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((b) => b.newPassword === b.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

/** Đổi session id khi đăng nhập để chống session fixation */
function startUserSession(req: Request, userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

authRouter.get("/me", (req, res) => {
  res.json({ user: req.user ?? null });
});

authRouter.post("/register", authLimiter, async (req, res) => {
  const body = registerBody.parse(req.body);

  const exists = await prisma.user.findFirst({ where: { username: body.username } });
  if (exists) {
    throw new HttpError(409, "Tên đăng nhập đã tồn tại");
  }

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: await hashPassword(body.password),
      fullname: body.fullname,
      email: body.email,
      phone: body.phone || null,
      permission: Permission.CUSTOMER,
      createdAt: new Date(),
    },
  });

  await startUserSession(req, user.id);
  res.status(201).json({ user: toAuthUser(user) });
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const body = loginBody.parse(req.body);

  const user = await prisma.user.findFirst({ where: { username: body.username } });
  const result = await verifyPassword(body.password, user?.password ?? null);
  if (!user || !result.ok) {
    throw new HttpError(401, "Tên đăng nhập hoặc mật khẩu không đúng");
  }

  // Nâng cấp hash MD5 cũ sang bcrypt. Không chặn đăng nhập nếu cột mật khẩu chưa được mở rộng.
  if (result.needsRehash) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(body.password) },
      });
    } catch (err) {
      console.warn("Không thể nâng cấp hash mật khẩu, hãy chạy migrations/001_password_hash.sql", err);
    }
  }

  await startUserSession(req, user.id);
  res.json({ user: toAuthUser(user) });
});

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("hostay.sid");
    res.status(204).end();
  });
});

const profileBody = z.object({
  fullname: z.string().trim().min(1, "Hãy nhập họ tên").max(100),
  email: z.string().trim().email("Email không hợp lệ").max(45),
  phone: z.string().trim().max(20).optional(),
});

authRouter.put("/profile", requireAuth, async (req, res) => {
  const body = profileBody.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { fullname: body.fullname, email: body.email, phone: body.phone || null },
  });
  res.json({ user: toAuthUser(user) });
});

authRouter.put("/password", requireAuth, async (req, res) => {
  const body = changePasswordBody.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const result = await verifyPassword(body.currentPassword, user?.password ?? null);
  if (!user || !result.ok) {
    throw new HttpError(400, "Mật khẩu hiện tại không đúng");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(body.newPassword) },
  });

  // Giữ đăng nhập trên thiết bị hiện tại nhưng cấp session id mới
  await startUserSession(req, user.id);
  res.status(204).end();
});
