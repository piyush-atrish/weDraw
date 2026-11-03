"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export interface User {
  id: number;
  email: string;
  userName: string | null;
}

interface SignupData {
  email: string;
  userName: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const fetchMe = () => api.get<{ user: User }>("/user/me").then((res) => res.data.user);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

const login = useCallback(async (email: string, password: string) => {
  await api.post("/user/signin", { email, password });
  setUser(await fetchMe());
}, []);

const signup = useCallback(
  async (data: SignupData) => {
    await api.post("/user/signup", data);
    await login(data.email, data.password);
  },
  [login],
);

const logout = useCallback(async () => {
  await api.post("/user/logout");
  setUser(null);
}, []);

  const value = useMemo(
    () => ({ user, isLoggedIn: user !== null, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}