import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ApiError, request, setToken, setUnauthorizedHandler } from "../api/client";
import { CANDIDATE_ROLE_ID } from "../lib/config";

export interface User { user_id: string; user_name: string; user_role_id: number }
interface AuthState {
  user: User | null; loading: boolean;
  signIn: (userId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const KEY_TOKEN = "es_token", KEY_USER = "es_user";
const Ctx = createContext<AuthState | null>(null);

/** JWT expiry (seconds since epoch) without verifying; the server is the real authority. */
function tokenExpired(token: string): boolean {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = JSON.parse(globalThis.atob(part)).exp;
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch { return false; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(async () => {
    setToken(null); setUser(null);
    await SecureStore.deleteItemAsync(KEY_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(KEY_USER).catch(() => {});
  }, []);

  // restore session on launch
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([SecureStore.getItemAsync(KEY_TOKEN), SecureStore.getItemAsync(KEY_USER)]);
        if (t && u && !tokenExpired(t)) { setToken(t); setUser(JSON.parse(u)); } else if (t) await clear();
      } catch { /* corrupted storage -> signed out */ }
      setLoading(false);
    })();
  }, [clear]);

  // any 401 from the API (expired/invalid token) signs the user out
  useEffect(() => { setUnauthorizedHandler(() => { void clear(); }); return () => setUnauthorizedHandler(null); }, [clear]);

  const signIn = useCallback(async (userId: string, password: string) => {
    const res = await request<any>("POST", "/auth/login", { user_id: userId.trim(), user_password: password }, { auth: false });
    if (!res?.Token || !res?.result) throw new ApiError(401, "Invalid credentials");
    const role = Number(res.result.user_role_id);
    if (role !== CANDIDATE_ROLE_ID) throw new ApiError(403, "This app is for interview candidates. Staff should use the ExamSentinel web portal.");
    // keep ONLY what the app needs (the login response also carries a password hash; never persist it)
    const u: User = { user_id: String(res.result.user_id), user_name: String(res.result.user_name ?? res.result.user_id), user_role_id: role };
    setToken(res.Token);
    await SecureStore.setItemAsync(KEY_TOKEN, res.Token);
    await SecureStore.setItemAsync(KEY_USER, JSON.stringify(u));
    setUser(u);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut: clear }), [user, loading, signIn, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
