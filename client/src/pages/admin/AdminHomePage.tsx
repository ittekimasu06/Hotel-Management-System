import { useAuth } from "../../auth/AuthContext";

// TODO (giai đoạn 4): dashboard thống kê và các trang quản lý
export function AdminHomePage() {
  const { user } = useAuth();
  return (
    <>
      <h1 className="h3">Trang quản trị</h1>
      <p className="text-muted">Xin chào {user?.fullname}. Các chức năng quản lý sẽ được bổ sung ở giai đoạn 4.</p>
    </>
  );
}
