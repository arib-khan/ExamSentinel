// hooks/useLoginAuditLogger.js
import { useCallback } from "react";
import apiClient from "@/services/apiClient";

export const useLoginAuditLogger = () => {
  const logLoginEvent = useCallback(async (eventType, payload = {}) => {
    try {
      const userAgent = navigator.userAgent;
      const student_id = payload.student_id?.id;
      const now = new Date();

      await apiClient.post("/api/activity-log/add", {
        //   await axios.post("http://localhost:3001/api/activity-log/add", {
        student_id,
        event_type: eventType,
        ip_address: payload.local_ip || "UNKNOWN",
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
    } catch (err) {
      console.error("Failed to log login audit", err);
    }
  }, []);

  return { logLoginEvent };
};
