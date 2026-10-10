import type { RequestHandler } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../db.js";
import { HttpError } from "../lib/http-error.js";

/** Mức quyền giống bản PHP: 0 khách hàng, 1–4 nhân viên, từ 5 quản trị cấp cao */
export const Permission = {
  CUSTOMER: 0,
  STAFF: 1,
  ADMIN: 5,
} as const;

export type AuthUser = {
  id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  permission: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
    permission: user.permission ?? Permission.CUSTOMER,
  };
}

/**
 * Nạp user từ session vào req.user. Đọc lại từ DB mỗi request để việc đổi quyền
 * hoặc xóa tài khoản có hiệu lực ngay.
 */
export const loadUser: RequestHandler = async (req, _res, next) => {
  const userId = req.session.userId;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      req.user = toAuthUser(user);
    } else {
      delete req.session.userId;
    }
  }
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    throw new HttpError(401, "Vui lòng đăng nhập");
  }
  next();
};

export function requirePermission(min: number): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new HttpError(401, "Vui lòng đăng nhập");
    }
    if (req.user.permission < min) {
      throw new HttpError(403, "Bạn không có quyền thực hiện thao tác này");
    }
    next();
  };
}
