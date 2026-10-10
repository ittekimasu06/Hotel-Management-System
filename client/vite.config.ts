import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Địa chỉ backend khi chạy dev; đổi bằng biến môi trường API_TARGET nếu cần
const apiTarget = process.env.API_TARGET ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Chuyển tiếp request tới backend để frontend và API cùng origin (cookie session hoạt động)
    proxy: {
      "/api": apiTarget,
      "/uploads": apiTarget,
    },
  },
});
