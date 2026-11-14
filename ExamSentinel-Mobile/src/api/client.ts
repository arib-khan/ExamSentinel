import { API_URL } from "../lib/config";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public body?: any) {
    super(message);
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
export const setToken = (t: string | null) => { token = t; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

/** fetch wrapper: base URL, bearer token, JSON, timeout, and mapping of backend errors. */
export async function request<T = any>(method: string, path: string, body?: unknown, opts: { auth?: boolean; timeoutMs?: number } = {}): Promise<T> {
  const { auth = true, timeoutMs = 20000 } = opts;
  if (!API_URL) throw new ApiError(0, "App is not configured: set EXPO_PUBLIC_API_URL");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(auth && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    let json: any = null;
    try { json = await res.json(); } catch { /* empty body */ }
    if (res.status === 401 && auth) onUnauthorized?.();
    if (!res.ok) throw new ApiError(res.status, json?.msg || json?.error || json?.message || `Request failed (${res.status})`, json?.code, json);
    return json as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (e?.name === "AbortError") throw new ApiError(0, "The server took too long to respond");
    throw new ApiError(0, "Cannot reach the server. Check your connection.");
  } finally {
    clearTimeout(timer);
  }
}

/** Backend envelope is { status, data, msg }; return only data. */
export const data = async <T,>(method: string, path: string, body?: unknown): Promise<T> => (await request<{ data: T }>(method, path, body)).data;
