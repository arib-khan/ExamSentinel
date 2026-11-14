import apiClient from "../apiClient";

// Every call returns the `data` field of { status, data, msg } from the backend.
const unwrap = (p) => p.then((r) => r.data.data);

export const interviewApi = {
  // lookups
  types: () => unwrap(apiClient.get("api/interviews/types")),

  // management
  list: (params) => unwrap(apiClient.get("api/interviews", { params })),
  get: (id) => unwrap(apiClient.get(`api/interviews/${id}`)),
  create: (body) => unwrap(apiClient.post("api/interviews", body)),
  update: (id, body) => unwrap(apiClient.put(`api/interviews/${id}`, body)),
  remove: (id) => unwrap(apiClient.delete(`api/interviews/${id}`)),
  publish: (id) => unwrap(apiClient.post(`api/interviews/${id}/publish`)),
  unpublish: (id, status = "draft") => unwrap(apiClient.post(`api/interviews/${id}/unpublish`, { status })),

  // questions
  questions: (id) => unwrap(apiClient.get(`api/interviews/${id}/questions`)),
  addQuestion: (id, body) => unwrap(apiClient.post(`api/interviews/${id}/questions`, body)),
  updateQuestion: (id, qid, body) => unwrap(apiClient.put(`api/interviews/${id}/questions/${qid}`, body)),
  deleteQuestion: (id, qid) => unwrap(apiClient.delete(`api/interviews/${id}/questions/${qid}`)),
  reorderQuestions: (id, order) => unwrap(apiClient.put(`api/interviews/${id}/questions/reorder`, { order })),

  // candidates
  candidates: (id) => unwrap(apiClient.get(`api/interviews/${id}/candidates`)),
  candidatePool: (search) => unwrap(apiClient.get("api/interviews/candidate-pool", { params: { search } })),
  assignCandidates: (id, candidate_ids, max_attempts) =>
    unwrap(apiClient.post(`api/interviews/${id}/candidates`, { candidate_ids, max_attempts })),
  updateCandidate: (id, candidateId, max_attempts) =>
    unwrap(apiClient.put(`api/interviews/${id}/candidates/${encodeURIComponent(candidateId)}`, { max_attempts })),
  removeCandidate: (id, candidateId) =>
    unwrap(apiClient.delete(`api/interviews/${id}/candidates/${encodeURIComponent(candidateId)}`)),

  // attempts / results / evaluation (evaluator)
  attempts: (id) => unwrap(apiClient.get(`api/interviews/${id}/attempts`)),
  results: (id) => unwrap(apiClient.get(`api/interviews/${id}/results`)),
  evaluation: (attemptId) => unwrap(apiClient.get(`api/interview-attempts/${attemptId}/evaluation`)),
  saveEvaluation: (attemptId, body) => unwrap(apiClient.put(`api/interview-attempts/${attemptId}/evaluation`, body)),
  finalizeEvaluation: (attemptId, comments) =>
    unwrap(apiClient.post(`api/interview-attempts/${attemptId}/evaluation/finalize`, { comments })),

  // candidate
  mine: () => unwrap(apiClient.get("api/interviews/mine")),
  start: (id) => unwrap(apiClient.post(`api/interviews/${id}/start`)),
  attemptView: (attemptId) => unwrap(apiClient.get(`api/interview-attempts/${attemptId}`)),
  saveAnswers: (attemptId, answers) => unwrap(apiClient.put(`api/interview-attempts/${attemptId}/answers`, { answers })),
  submit: (attemptId, answers) => unwrap(apiClient.post(`api/interview-attempts/${attemptId}/submit`, { answers })),
  sendEvent: (attemptId, event_type, details) =>
    unwrap(apiClient.post(`api/interview-attempts/${attemptId}/events`, { event_type, details, source: "web" })),
  result: (attemptId) => unwrap(apiClient.get(`api/interview-attempts/${attemptId}/result`)),
};

export const apiErrorMessage = (e) => e?.response?.data?.msg || e?.message || "Something went wrong";
export const apiErrorCode = (e) => e?.response?.data?.code;
