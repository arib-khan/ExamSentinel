import { useEffect } from "react";

export const useDisableInspect = () => {
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();

    const disableDevToolsKeys = (e) => {
      if (!e || !e.key) return;

      const key = e.key.toLowerCase();
      const isCtrlShift = e.ctrlKey && e.shiftKey;

      const isBlocked =
        e.key === "F12" ||
        (isCtrlShift && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u");

      if (isBlocked) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("keydown", disableDevToolsKeys); // ✅ correct usage

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("keydown", disableDevToolsKeys);
    };
  }, []);
};
