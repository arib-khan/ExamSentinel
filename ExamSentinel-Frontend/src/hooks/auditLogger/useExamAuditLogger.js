// hooks/useExamAuditLogger.js
import apiClient from "@/services/apiClient";
import { useCallback } from "react";

export const useExamAuditLogger = () => {
  const logExamEvent = useCallback(async (eventType, payload = {}) => {
    try {
      const studentId = JSON.parse(sessionStorage.getItem("studentData"));
      const student_id = studentId.id;
      const userAgent = navigator.userAgent;
      const now = new Date();

      await apiClient.post("/api/activity-log/add", {
        event_type: eventType,
        student_id,
        // deviceInfo: userAgent,
        // ...payload,
        timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")} ${String(
          now.getHours()
        ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
          2,
          "0"
        )}:${String(now.getSeconds()).padStart(2, "0")}`,
      });
    } catch (error) {
      console.error("📄 Exam audit log failed:", error);
    }
  }, []);

  return { logExamEvent };
};

export const useOptionAuditLogger = () => {
  const optionEvents = useCallback(async (eventType, payload = {}) => {
    try {
      const studentId = JSON.parse(sessionStorage.getItem("studentData"));
      const student_id = studentId.id;
      const userAgent = navigator.userAgent;
      const now = new Date();

      
      await apiClient.post("/api/student_answers_log/add", {
        event_type: eventType,
        student_id,
        // deviceInfo: userAgent,
        ...payload,
        timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")} ${String(
          now.getHours()
        ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
          2,
          "0"
        )}:${String(now.getSeconds()).padStart(2, "0")}`,
      });
    } catch (error) {
      console.error("📄 Exam audit log failed:", error);
    }
  }, []);

  return { optionEvents };
};
