import { useState, useEffect, useRef } from 'react';

const useProctoring = (timeout = 5 * 60 * 1000, onSuspiciousActivity) => {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutIdRef = useRef(null);
  const activityEvents = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

  useEffect(() => {
    const startTimer = () => {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        setIsInactive(true);
      }, timeout);
    };

    const handleActivity = () => {
      clearTimeout(timeoutIdRef.current);
      if (isInactive) {
        setIsInactive(false); // Hide yellow circle when user resumes
      }
      startTimer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onSuspiciousActivity?.('User switched tabs or minimized the window.');
      }
    };

    const handleCopyPaste = (event) => {
      onSuspiciousActivity?.(`User tried to ${event.type}.`);
      event.preventDefault();
    };

    // const handleContextMenu = (event) => {
    //   onSuspiciousActivity?.('User tried to right-click.');
    //   event.preventDefault();
    // };

    // Add event listeners
    activityEvents.forEach(event => window.addEventListener(event, handleActivity));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    // document.addEventListener('contextmenu', handleContextMenu);

    startTimer(); // Start timer when mounted

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      // document.removeEventListener('contextmenu', handleContextMenu);
      clearTimeout(timeoutIdRef.current);
    };
  }, [timeout, isInactive, onSuspiciousActivity]);

  return isInactive;
};

export default useProctoring;
