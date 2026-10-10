import { Router } from "express";
import { Permission, requirePermission } from "../../middleware/auth.js";
import { adminBookingsRouter } from "./bookings.js";
import { adminBillStatusesRouter, adminRoomTypesRouter } from "./catalogs.js";
import { adminContactsRouter } from "./contacts.js";
import { adminDashboardRouter } from "./dashboard.js";
import { adminExportsRouter } from "./exports.js";
import { adminRoomsRouter } from "./rooms.js";
import { adminUsersRouter } from "./users.js";

export const adminRouter = Router();

// Mọi API quản trị yêu cầu quyền nhân viên trở lên
adminRouter.use(requirePermission(Permission.STAFF));

adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/rooms", adminRoomsRouter);
adminRouter.use("/room-types", adminRoomTypesRouter);
adminRouter.use("/bill-statuses", adminBillStatusesRouter);
adminRouter.use("/bookings", adminBookingsRouter);
adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/contacts", adminContactsRouter);
adminRouter.use("/exports", adminExportsRouter);
