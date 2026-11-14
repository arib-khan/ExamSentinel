import { useEffect } from "react";
import { useExamAuditLogger } from "./useExamAuditLogger";

export const useExamEnvironmentMonitor = () => {
  const { logExamEvent } = useExamAuditLogger();

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 400 || window.innerHeight < 300) {
        logExamEvent("WINDOW_MINIMIZED_OR_RESIZED", {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    let idleTimer = null;
    let idleStartTime = null;

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);

      if (idleStartTime) {
        const idleDuration = Math.floor((Date.now() - idleStartTime) / 1000);
        if (idleDuration > 60) {
          logExamEvent("USER_IDLE_END", { duration: idleDuration });
        }
        idleStartTime = null;
      }

      idleTimer = setTimeout(() => {
        idleStartTime = Date.now();
        logExamEvent("USER_IDLE_START", {
          message: "User inactive for 60+ seconds",
        });
      }, 60000); // 60 seconds idle timeout
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer(); // start timer

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Detect PrintScreen
      if (e.key === "PrintScreen") {
        logExamEvent("SCREENSHOT_ATTEMPT", { key: e.key });
      }

      // Detect macOS shortcut Cmd + Shift + 4 (partial detection)
      if (e.metaKey && e.shiftKey && e.key === "4") {
        logExamEvent("SCREENSHOT_ATTEMPT", { keyCombo: "Cmd+Shift+4" });
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        logExamEvent("POSSIBLE_SCREENSHOT_ATTEMPT", {
          keyCombo: "Ctrl + Shift + S",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
