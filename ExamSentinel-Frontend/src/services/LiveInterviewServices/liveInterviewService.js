import apiClient from "../apiClient";

// Every call returns the `data` field of { status, data, msg } sent by the backend.
const unwrap = (p) => p.then((r) => r.data.data);

export const liveApi = {
  // HR
  list: (params) => unwrap(apiClient.get("api/live-interviews", { params })),
  create: (body) => unwrap(apiClient.post("api/live-interviews", body)),
  update: (id, body) => unwrap(apiClient.put(`api/live-interviews/${id}`, body)),
  cancel: (id) => unwrap(apiClient.post(`api/live-interviews/${id}/cancel`)),
  end: (id) => unwrap(apiClient.post(`api/live-interviews/${id}/end`)),
  invite: (id, note) => unwrap(apiClient.post(`api/live-interviews/${id}/invite`, { note })),
  candidatePool: (search) => unwrap(apiClient.get("api/live-interviews/candidate-pool", { params: { search } })),
  createCandidate: (body) => unwrap(apiClient.post("api/live-interviews/candidates", body)),
  timeline: (id) => unwrap(apiClient.get(`api/live-interviews/${id}/timeline`)),
  // candidate
  mine: () => unwrap(apiClient.get("api/live-interviews/mine")),
  // both
  get: (id) => unwrap(apiClient.get(`api/live-interviews/${id}`)),
  status: (id) => unwrap(apiClient.get(`api/live-interviews/${id}/status`)),
  /** role: host | candidate | monitor. Candidate/monitor must pass consent:true. */
  token: (id, { role, consent, client = "web" }) => unwrap(apiClient.post(`api/live-interviews/${id}/token`, { role, consent, client })),
  event: (id, role, event_type, details) => unwrap(apiClient.post(`api/live-interviews/${id}/events`, { role, event_type, details })),
};

export const apiErrorMessage = (e) => e?.response?.data?.msg || e?.message || "Something went wrong";
export const apiErrorCode = (e) => e?.response?.data?.code;
export const apiErrorData = (e) => e?.response?.data || {};
