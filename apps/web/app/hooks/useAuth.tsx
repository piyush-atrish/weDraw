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

export type AuthResult = { verificationRequired: false } | { verificationRequired: true; email: string };

interface SessionResponse {
  status: "ok" | "verification_required";
  email?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (data: SignupData) => Promise<AuthResult>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
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

  const handleSession = useCallback(async (data: SessionResponse): Promise<AuthResult> => {
    if (data.status === "verification_required" && data.email) {
      return { verificationRequired: true, email: data.email };
    }
    setUser(await fetchMe());
    return { verificationRequired: false };
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      handleSession((await api.post<SessionResponse>("/user/signin", { email, password })).data),
    [handleSession],
  );

  const signup = useCallback(
    async (data: SignupData) => handleSession((await api.post<SessionResponse>("/user/signup", data)).data),
    [handleSession],
  );

  const requestOtp = useCallback(async (email: string) => {
    await api.post("/user/otp/request", { email });
  }, []);

  const verifyOtp = useCallback(
    async (email: string, code: string) => {
      await handleSession((await api.post<SessionResponse>("/user/otp/verify", { email, code })).data);
    },
    [handleSession],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      await handleSession((await api.post<SessionResponse>("/user/google", { credential })).data);
    },
    [handleSession],
  );

  const logout = useCallback(async () => {
    await api.post("/user/logout");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: user !== null,
      isLoading,
      login,
      signup,
      requestOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, login, signup, requestOtp, verifyOtp, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}