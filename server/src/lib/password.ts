import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const COST = 10;
const LEGACY_MD5 = /^[a-f0-9]{32}$/i;

// Hash giả dùng khi không tìm thấy user, để thời gian phản hồi không lộ username có tồn tại hay không
const DUMMY_HASH = bcrypt.hashSync("dummy-password", COST);

/**
 * Băm mật khẩu bằng bcrypt. Dùng tiền tố $2y$ (giống PHP password_hash, cùng thuật toán với $2b$)
 * để bản PHP vẫn đọc được trong giai đoạn chạy song song.
 */
export async function hashPassword(plain: string): Promise<string> {
  const hash = await bcrypt.hash(plain, COST);
  return hash.replace(/^\$2b\$/, "$2y$");
}

export type VerifyResult = { ok: boolean; needsRehash: boolean };

/**
 * Kiểm tra mật khẩu với hash đã lưu. Hỗ trợ hash MD5 cũ của bản PHP đầu tiên.
 */
export async function verifyPassword(plain: string, stored: string | null): Promise<VerifyResult> {
  if (!stored) {
    await bcrypt.compare(plain, DUMMY_HASH);
    return { ok: false, needsRehash: false };
  }
  if (LEGACY_MD5.test(stored)) {
    const actual = Buffer.from(createHash("md5").update(plain).digest("hex"));
    const expected = Buffer.from(stored.toLowerCase());
    const ok = actual.length === expected.length && timingSafeEqual(actual, expected);
    return { ok, needsRehash: ok };
  }
  const ok = await bcrypt.compare(plain, stored);
  return { ok, needsRehash: ok && bcrypt.getRounds(stored) < COST };
}
