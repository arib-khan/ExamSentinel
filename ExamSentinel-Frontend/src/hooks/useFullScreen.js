// hooks/useFullScreen.js
import { useCallback } from "react";

export const useFullScreen = () => {
  const enterFullScreen = useCallback(() => {
    const el = document.documentElement;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); // Safari
    else if (el.msRequestFullscreen) el.msRequestFullscreen(); // IE11
  }, []);

  return enterFullScreen;
};
