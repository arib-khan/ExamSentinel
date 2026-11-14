// hooks/useBlockClipboard.js
import { useEffect } from "react";

export const useBlockClipboard = () => {
  useEffect(() => {
    const blockClipboard = (e) => {
      e.preventDefault();
      //   alert("Clipboard actions are disabled during the exam.");
    };

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("cut", blockClipboard);

    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
    };
  }, []);
};
