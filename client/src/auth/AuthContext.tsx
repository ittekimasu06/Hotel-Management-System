import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";

export type User = {
  id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  permission: number;
};

export const Permission = { CUSTOMER: 0, STAFF: 1, ADMIN: 5 } as const;

export type RegisterInput = {
  username: string;
  password: string;
  confirmPassword: string;
  fullname: string;
  email: string;
  phone?: string;
};

export type ProfileInput = { fullname: string; email: string; phone?: string };

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User | null }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const r = await api<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(r.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const r = await api<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: ProfileInput) => {
    const r = await api<{ user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    setUser(r.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
