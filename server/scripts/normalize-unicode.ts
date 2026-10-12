/**
 * Chuẩn hóa dữ liệu văn bản cũ trong database về Unicode NFC (chạy một lần).
 *
 * Dữ liệu nhập từ bản PHP có chỗ lưu tiếng Việt ở dạng tổ hợp (NFD), làm tìm kiếm như
 * "Hà Nội" không khớp. Script đọc mọi cột chuỗi của 6 bảng và chỉ ghi lại những ô cần đổi.
 *
 *   npm run db:normalize            # xem trước, không ghi gì
 *   npm run db:normalize -- --apply # ghi thay đổi (nên sao lưu database trước)
 */
import mysql from "mysql2/promise";
// Dùng chung cấu hình kết nối của server (đọc .env, hỗ trợ SSL qua DB_SSL_CA)
import { config } from "../src/config.js";

const TABLES: Record<string, { id: string; columns: string[] }> = {
  tbluser: { id: "user_id", columns: ["user_name", "user_fullname", "user_email", "user_phone"] },
  tblroomtype: { id: "roomtype_id", columns: ["roomtype_name", "roomtype_notes"] },
  tblroom: { id: "room_id", columns: ["room_bed_type", "room_detail", "room_address", "room_hotel_name"] },
  tblbillstatic: { id: "billstatic_id", columns: ["billstatic_name", "billstatic_notes"] },
  tblbill: { id: "bill_id", columns: ["bill_fullname", "bill_email", "bill_phone", "bill_notes", "bill_staff_name"] },
  tblcontact: { id: "contact_id", columns: ["contact_fullname", "contact_email", "contact_subject", "contact_notes"] },
};

const apply = process.argv.includes("--apply");
const con = await mysql.createConnection({
  ...config.db,
  charset: "utf8mb4",
});

let changed = 0;
try {
  await con.beginTransaction();
  for (const [table, { id, columns }] of Object.entries(TABLES)) {
    const [rows] = await con.query<mysql.RowDataPacket[]>(`SELECT ${id}, ${columns.join(", ")} FROM ${table}`);
    for (const row of rows) {
      const updates = columns.filter((c) => typeof row[c] === "string" && row[c] !== row[c].normalize("NFC"));
      if (updates.length === 0) continue;
      changed += updates.length;
      for (const c of updates) console.log(`${table}#${row[id]}.${c}: ${JSON.stringify(row[c]).slice(0, 60)}`);
      if (apply) {
        const set = updates.map((c) => `${c} = ?`).join(", ");
        await con.query(`UPDATE ${table} SET ${set} WHERE ${id} = ?`, [...updates.map((c) => row[c].normalize("NFC")), row[id]]);
      }
    }
  }
  if (apply) await con.commit();
  else await con.rollback();
  console.log(apply ? `Đã chuẩn hóa ${changed} ô dữ liệu.` : `Có ${changed} ô cần chuẩn hóa. Chạy lại với --apply để ghi.`);
} catch (err) {
  await con.rollback();
  console.error("Lỗi, đã hoàn tác:", err);
  process.exitCode = 1;
} finally {
  await con.end();
}
