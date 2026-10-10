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
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

const authed = (page: ReactNode, minPermission = 0) => <RequireAuth minPermission={minPermission}>{page}</RequireAuth>;

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="account" element={authed(<AccountPage />)} />
        <Route path="bookings" element={authed(<BookingsPage />)} />
        <Route path="bookings/:id" element={authed(<BookingDetailPage />)} />
        <Route path="admin" element={authed(<AdminHomePage />, Permission.STAFF)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
