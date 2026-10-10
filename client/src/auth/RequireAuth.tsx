import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Chặn truy cập phía giao diện. Quyền thật sự vẫn do API kiểm tra.
 */
export function RequireAuth({ minPermission = 0, children }: { minPermission?: number; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Đang tải...</p>;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (user.permission < minPermission) {
    return <div className="alert alert-warning">Bạn không có quyền truy cập trang này.</div>;
  }
  return <>{children}</>;
}
