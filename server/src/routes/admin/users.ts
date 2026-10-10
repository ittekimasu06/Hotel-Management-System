import { Router } from "express";
import type { Prisma, User } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import { idParam, paged, pagingQuery } from "../../lib/paging.js";
import { hashPassword } from "../../lib/password.js";
import { Permission, type AuthUser } from "../../middleware/auth.js";

export const adminUsersRouter = Router();

/** Các mức quyền được phép gán (giống lựa chọn trong bản PHP) */
const ALLOWED_PERMISSIONS: number[] = [Permission.CUSTOMER, Permission.STAFF, Permission.ADMIN];
const permissionValue = z
  .number()
  .int()
  .refine((v) => ALLOWED_PERMISSIONS.includes(v), "Quyền không hợp lệ (0: khách hàng, 1: nhân viên, 5: quản trị)");

function toJson(u: User) {
  return {
    id: u.id,
    username: u.username,
    fullname: u.fullname,
    email: u.email,
    phone: u.phone,
    permission: u.permission ?? 0,
    createdAt: u.createdAt?.toISOString() ?? null,
  };
}

/** Chỉ được quản lý người có quyền thấp hơn hoặc bằng mình (quy tắc của bản PHP) */
function assertCanManage(actor: AuthUser, target: User) {
  if ((target.permission ?? 0) > actor.permission) {
    throw new HttpError(403, "Bạn không thể thay đổi tài khoản có quyền cao hơn mình");
  }
}

function assertCanGrant(actor: AuthUser, permission: number) {
  if (permission > actor.permission) {
    throw new HttpError(403, "Bạn không thể cấp quyền cao hơn quyền của mình");
  }
}

async function findUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, "Không tìm thấy người dùng");
  return user;
}

const listQuery = pagingQuery.extend({ key: z.string().trim().max(100).optional() });

adminUsersRouter.get("/", async (req, res) => {
  const q = listQuery.parse(req.query);
  const where: Prisma.UserWhereInput = q.key
    ? { OR: [{ username: { contains: q.key } }, { fullname: { contains: q.key } }, { email: { contains: q.key } }] }
    : {};
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { id: "asc" }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
  ]);
  res.json(paged(users.map(toJson), q.page, q.pageSize, total));
});

adminUsersRouter.get("/:id", async (req, res) => {
  res.json(toJson(await findUser(idParam.parse(req.params.id))));
});

const profileFields = {
  fullname: z.string().trim().min(1, "Hãy nhập họ tên").max(100),
  email: z.string().trim().email("Email không hợp lệ").max(45),
  phone: z.string().trim().max(20).optional(),
  permission: permissionValue,
};

const createBody = z
  .object({
    ...profileFields,
    username: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(45)
      .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập chỉ gồm chữ, số, dấu _ và ."),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(72),
    confirmPassword: z.string(),
  })
  .refine((b) => b.password === b.confirmPassword, { message: "Mật khẩu nhập lại không khớp", path: ["confirmPassword"] });

adminUsersRouter.post("/", async (req, res) => {
  const body = createBody.parse(req.body);
  assertCanGrant(req.user!, body.permission);
  if (await prisma.user.findFirst({ where: { username: body.username } })) {
    throw new HttpError(409, "Tên đăng nhập đã tồn tại");
  }
  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: await hashPassword(body.password),
      fullname: body.fullname,
      email: body.email,
      phone: body.phone || null,
      permission: body.permission,
      createdAt: new Date(),
    },
  });
  res.status(201).json(toJson(user));
});

const updateBody = z.object(profileFields);

adminUsersRouter.put("/:id", async (req, res) => {
  const target = await findUser(idParam.parse(req.params.id));
  const body = updateBody.parse(req.body);
  assertCanManage(req.user!, target);
  assertCanGrant(req.user!, body.permission);
  if (target.id === req.user!.id && body.permission !== req.user!.permission) {
    throw new HttpError(400, "Bạn không thể tự thay đổi quyền của chính mình");
  }
  const user = await prisma.user.update({
    where: { id: target.id },
    data: { fullname: body.fullname, email: body.email, phone: body.phone || null, permission: body.permission },
  });
  res.json(toJson(user));
});

adminUsersRouter.delete("/:id", async (req, res) => {
  const target = await findUser(idParam.parse(req.params.id));
  if (target.id === req.user!.id) throw new HttpError(400, "Bạn không thể tự xóa tài khoản của mình");
  assertCanManage(req.user!, target);
  const bookings = await prisma.bill.count({ where: { customerId: target.id } });
  if (bookings > 0) {
    throw new HttpError(409, `Người dùng có ${bookings} đơn đặt phòng, không thể xóa`);
  }
  await prisma.user.delete({ where: { id: target.id } });
  res.status(204).end();
});
