"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiMe, type AuthUser } from "../lib/auth-api";

const TOKEN_KEY = "sqs_token";
const USER_KEY = "sqs_user";

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `sqs_token=${token};path=/;max-age=${maxAge};SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "sqs_token=;path=/;max-age=0";
}

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    const me = await apiMe(t);
    if (!me) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      clearAuthCookie();
      setUser(null);
      setToken(null);
      return;
    }
    setToken(t);
    setUser(me);
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    setAuthCookie(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        const cached = localStorage.getItem(USER_KEY);
        if (t && cached) {
          try {
            setUser(JSON.parse(cached) as AuthUser);
            setToken(t);
            setAuthCookie(t);
          } catch {
            /* ignore */
          }
        }
        if (t) {
          await refreshUser();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const setSession = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setAuthCookie(t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, setSession, logout, refreshUser }),
    [user, token, loading, setSession, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
