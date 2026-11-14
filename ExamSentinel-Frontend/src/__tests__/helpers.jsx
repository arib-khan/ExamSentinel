import React from "react";
import { render } from "@testing-library/react";

/**
 * Boots the REAL app (store, providers, router, sidebar, permission loading, lazy routes) exactly like main.jsx,
 * with the REAL axios apiClient, answering HTTP from an in-memory fake backend (axios adapter).
 * role === null -> signed-out visitor.
 */
export async function bootApp({ path, role, user, permissions, routes }) {
  sessionStorage.clear();
  if (role != null) {
    sessionStorage.setItem("authToken", "test-token");
    sessionStorage.setItem("userData", JSON.stringify({ user_id: user.user_id, user_name: user.user_name, user_role_id: role }));
  }
  window.history.pushState({}, "", path);
  const { config } = await import("@/config");
  config.config = { VITE_API_BASE_URL: "http://api.test/", VITE_API_CLOUD_URL: "", VITE_SOCKET_URL: "" }; config.loaded = true;
  const apiClient = (await import("@/services/apiClient")).default;
  const calls = [];
  apiClient.defaults.adapter = async (cfg) => {
    const url = (cfg.url || "").replace(/^\//, ""), method = (cfg.method || "get").toUpperCase();
    const body = cfg.data ? JSON.parse(cfg.data) : undefined;
    calls.push({ method, url, body });
    let hit;
    if (url === "api/userpermision/list") hit = { status: true, data: { permissionsData: permissions }, msg: "ok" };
    else for (const [key, handler] of Object.entries(routes)) {
      const [m, pattern] = key.split(" ");
      if (m === method && new RegExp("^" + pattern + "$").test(url)) { hit = typeof handler === "function" ? handler({ url, body, calls }) : handler; break; }
    }
    if (hit === undefined) hit = { status: true, data: [], msg: "unmocked" };
    const status = hit.__status || 200; if (hit.__status) { hit = { ...hit }; delete hit.__status; }
    const response = { data: hit, status, statusText: "OK", headers: {}, config: cfg };
    if (status >= 400) { const err = new Error("HTTP " + status); err.response = response; err.config = cfg; err.isAxiosError = true; throw err; }
    return response;
  };
  const { Provider } = await import("react-redux");
  const { store } = await import("@/store");
  const { ThemeProvider } = await import("@/constants/theme-provider");
  const { UserRoleProvider } = await import("@/contexts/UserRoleContext");
  const { PermissionProvider } = await import("@/contexts/PermissionContext");
  const { ExamSocketProvider } = await import("@/store/context/ExamSocketContext");
  const App = (await import("@/App.jsx")).default;
  const ui = render(<Provider store={store}><ThemeProvider defaultTheme="light" storageKey="t"><ExamSocketProvider><UserRoleProvider><PermissionProvider><App /></PermissionProvider></UserRoleProvider></ExamSocketProvider></ThemeProvider></Provider>);
  return { ...ui, calls };
}
export const ok = (data, msg = "OK") => ({ status: true, data, msg });
/** A syntactically valid LiveKit-style JWT so the fake Room can read identity/room from it. */
export const fakeJwt = (sub, room, name) => `h.${btoa(JSON.stringify({ sub, room, name }))}.s`;
