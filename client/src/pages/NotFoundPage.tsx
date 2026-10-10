import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-6">Không tìm thấy trang</h1>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}
