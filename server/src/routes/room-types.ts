import { Router } from "express";
import { prisma } from "../db.js";

export const roomTypesRouter = Router();

roomTypesRouter.get("/", async (_req, res) => {
  const types = await prisma.roomType.findMany({ orderBy: { id: "asc" } });
  res.json(types.map((t) => ({ id: t.id, name: t.name, notes: t.notes })));
});
