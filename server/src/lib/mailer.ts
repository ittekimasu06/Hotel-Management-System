import nodemailer from "nodemailer";
import { config } from "../config.js";
import { HttpError } from "./http-error.js";

const transporter = config.smtp.enabled
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Gửi email văn bản thuần; nội dung được escape và giữ xuống dòng trong bản HTML */
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  if (!transporter) {
    throw new HttpError(503, "Chưa cấu hình SMTP trên máy chủ (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }
  await transporter.sendMail({
    from: { name: config.smtp.fromName, address: config.smtp.user },
    to,
    subject,
    text,
    html: escapeHtml(text).replace(/\r?\n/g, "<br>"),
  });
}
