import { data } from "./client";

export type JoinState = "upcoming" | "available" | "live" | "ended" | "cancelled" | "expired";
export interface LiveInterview {
  id: number; meeting_code: string; title: string; description: string | null;
  scheduled_start: string; scheduled_end: string; duration_minutes: number;
  status: string; join_state: JoinState; opens_at: string; monitoring_required: boolean;
  started_at: string | null; ended_at: string | null; host_name: string; candidate_name: string; join_link: string;
}
export type Role = "candidate" | "monitor";
export interface TokenResponse { token: string; url: string; identity: string; room: string; role: string; expires_in: number; interview: LiveInterview }
export interface Presence { connected: boolean; camera: boolean; microphone: boolean }
export interface LiveStatus {
  status: string; join_state: JoinState; started_at: string | null; ended_at: string | null; elapsed_seconds: number;
  monitoring_required: boolean; livekit_available: boolean; server_time: string;
  participants: { host: Presence; candidate: Presence; monitor: Presence };
}

export const liveApi = {
  mine: () => data<LiveInterview[]>("GET", "/api/live-interviews/mine"),
  get: (id: number | string) => data<LiveInterview>("GET", `/api/live-interviews/${id}`),
  status: (id: number | string) => data<LiveStatus>("GET", `/api/live-interviews/${id}/status`),
  /** consent must be true for candidate and monitor; the server refuses otherwise */
  token: (id: number | string, role: Role, consent: boolean) =>
    data<TokenResponse>("POST", `/api/live-interviews/${id}/token`, { role, consent, client: "mobile" }),
  event: (id: number | string, role: Role, event_type: string, details?: object) =>
    data("POST", `/api/live-interviews/${id}/events`, { role, event_type, details }),
};
