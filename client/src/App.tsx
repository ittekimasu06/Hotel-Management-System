import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Permission } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { RoomsPage } from "./pages/RoomsPage";
import { RoomDetailPage } from "./pages/RoomDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AccountPage } from "./pages/AccountPage";
import { BookingsPage } from "./pages/BookingsPage";
import { BookingDetailPage } from "./pages/BookingDetailPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { BookingsAdminPage } from "./pages/admin/BookingsAdminPage";
import { BookingAdminDetailPage } from "./pages/admin/BookingAdminDetailPage";
import { CatalogPage } from "./pages/admin/CatalogPage";
import { ContactsAdminPage } from "./pages/admin/ContactsAdminPage";
import { RoomFormPage } from "./pages/admin/RoomFormPage";
import { RoomsAdminPage } from "./pages/admin/RoomsAdminPage";
import { UserFormPage } from "./pages/admin/UserFormPage";
import { UsersAdminPage } from "./pages/admin/UsersAdminPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const authed = (page: ReactNode, minPermission = 0) => <RequireAuth minPermission={minPermission}>{page}</RequireAuth>;

export function App() {
  return (
    <Routes>
      {/* Trang riêng, không dùng layout chung (giống bản cũ) */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="bookings/:id" element={authed(<BookingDetailPage />)} />

      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="account" element={authed(<AccountPage />)} />
        <Route path="bookings" element={authed(<BookingsPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="admin" element={authed(<AdminLayout />, Permission.STAFF)}>
          <Route index element={<AdminHomePage />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
          <Route path="bookings/:id" element={<BookingAdminDetailPage />} />
          <Route path="bill-statuses" element={<CatalogPage key="bill-statuses" title="Trạng thái đơn" section="Đơn đặt phòng" endpoint="/admin/bill-statuses" itemLabel="trạng thái" />} />
          <Route path="rooms" element={<RoomsAdminPage />} />
          <Route path="rooms/:id" element={<RoomFormPage />} />
          <Route path="room-types" element={<CatalogPage key="room-types" title="Loại phòng" section="Phòng" endpoint="/admin/room-types" itemLabel="loại phòng" />} />
          <Route path="users" element={<UsersAdminPage />} />
          <Route path="users/:id" element={<UserFormPage />} />
          <Route path="contacts" element={<ContactsAdminPage />} />
      </Route>
    </Routes>
  );
}
