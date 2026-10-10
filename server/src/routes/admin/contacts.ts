import { Router } from "express";
import type { Contact, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/http-error.js";
import { sendMail } from "../../lib/mailer.js";
import { idParam, paged, pagingQuery } from "../../lib/paging.js";

export const adminContactsRouter = Router();

function toJson(c: Contact) {
  return {
    id: c.id,
    fullname: c.fullname,
    email: c.email,
    subject: c.subject,
    notes: c.notes,
    seen: (c.seen ?? 0) !== 0,
    createdAt: c.createdAt.toISOString(),
  };
}

async function findContact(id: number) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new HttpError(404, "Không tìm thấy liên hệ");
  return contact;
}

const listQuery = pagingQuery.extend({ seen: z.enum(["true", "false"]).optional() });

adminContactsRouter.get("/", async (req, res) => {
  const q = listQuery.parse(req.query);
  const where: Prisma.ContactWhereInput = q.seen ? (q.seen === "true" ? { seen: { not: 0 } } : { seen: 0 }) : {};
  const [total, contacts] = await prisma.$transaction([
    prisma.contact.count({ where }),
    prisma.contact.findMany({ where, orderBy: { id: "desc" }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
  ]);
  res.json(paged(contacts.map(toJson), q.page, q.pageSize, total));
});

adminContactsRouter.put("/:id/seen", async (req, res) => {
  const contact = await findContact(idParam.parse(req.params.id));
  const { seen } = z.object({ seen: z.boolean() }).parse(req.body);
  res.json(toJson(await prisma.contact.update({ where: { id: contact.id }, data: { seen: seen ? 1 : 0 } })));
});

adminContactsRouter.post("/:id/reply", async (req, res) => {
  const contact = await findContact(idParam.parse(req.params.id));
  const { message } = z
    .object({ message: z.string().trim().min(1, "Hãy nhập nội dung trả lời").max(10_000) })
    .parse(req.body);

  const created = contact.createdAt.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  await sendMail(contact.email, `Hostay trả lời phản hồi của bạn ngày ${created}: ${contact.subject}`, message);

  const updated = await prisma.contact.update({ where: { id: contact.id }, data: { seen: 1 } });
  res.json(toJson(updated));
});

adminContactsRouter.delete("/:id", async (req, res) => {
  const contact = await findContact(idParam.parse(req.params.id));
  await prisma.contact.delete({ where: { id: contact.id } });
  res.status(204).end();
});
