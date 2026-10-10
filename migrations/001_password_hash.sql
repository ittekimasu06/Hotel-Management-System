-- Mở rộng cột mật khẩu để lưu hash bcrypt/argon2 (password_hash).
-- Chạy một lần trên database đã import trước đây.
-- Hash MD5 cũ vẫn đăng nhập được và sẽ tự nâng cấp ở lần đăng nhập tiếp theo.
ALTER TABLE `tbluser`
  MODIFY `user_password` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
