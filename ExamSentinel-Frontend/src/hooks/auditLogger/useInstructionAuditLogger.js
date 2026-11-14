// hooks/useInstructionAuditLogger.js
import { useCallback } from "react";
import apiClient from "@/services/apiClient";

export const useInstructionAuditLogger = () => {
  const logInstructionEvent = useCallback(async (eventType, payload = {}) => {
    try {
      const userAgent = navigator.userAgent;
      const studentId = JSON.parse(sessionStorage.getItem("studentData")); // update if your ID is stored differently

      const student_id = studentId.id;
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
      console.error("Instruction Audit Log Failed:", error);
    }
  }, []);

  return { logInstructionEvent };
};
