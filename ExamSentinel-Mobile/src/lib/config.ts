// The ONLY configuration the app needs: the ExamSentinel backend URL.
const raw = process.env.EXPO_PUBLIC_API_URL ?? "";
export const API_URL = raw.replace(/\/+$/, "");
export const isConfigured = API_URL.length > 0;

/** Role id of the "Candidate" role created by backend migrations/interview/002_interview_permissions.sql */
export const CANDIDATE_ROLE_ID = 6;
