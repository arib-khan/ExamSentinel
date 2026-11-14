// hooks/useAntiCheating.js
import { useState, useEffect, useCallback, useRef } from "react";

const useAntiCheating = (options = {}) => {
  const {
    onViolation = () => {},
    onExamEnd = () => {},
    maxViolations = 3,
    enableFullscreen = true,
    enableTabSwitch = true,
    enableRightClick = true,
    enableKeyboardRestrictions = true,
    enableMouseLeave = true,
    enableDevTools = true,
    enableCopyPaste = true,
    warningDuration = 5000,
    autoSubmitOnMaxViolations = true,
  } = options;

  const [violations, setViolations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warning, setWarning] = useState("");
  const [isExamActive, setIsExamActive] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const warningTimeoutRef = useRef(null);
  const devToolsIntervalRef = useRef(null);
  const previousWindowSize = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const lastDevToolsCheck = useRef(Date.now());

  // Computed values
  const violationCount = violations.length;
  const remainingViolations = Math.max(0, maxViolations - violationCount);

  // Violation handler
  const handleViolation = useCallback(
    (type, details = "") => {
      const violation = {
        type,
        details,
        timestamp: new Date().toISOString(),
        id: Date.now(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
      };

      setViolations((prev) => {
        const newViolations = [...prev, violation];

        // Check if max violations reached
        if (newViolations.length >= maxViolations) {
          setIsBlocked(true);
          if (autoSubmitOnMaxViolations) {
            setTimeout(() => onExamEnd("MAX_VIOLATIONS_REACHED"), 100);
          }
        }

        return newViolations;
      });

      onViolation(violation);
      showWarning(
        `Security Alert: ${type} (${violationCount + 1}/${maxViolations})`
      );
    },
    [
      violationCount,
      maxViolations,
      onViolation,
      autoSubmitOnMaxViolations,
      onExamEnd,
    ]
  );

  // Manual violation trigger (for external use)
  const triggerViolation = useCallback(
    (type, details) => {
      handleViolation(type, details);
    },
    [handleViolation]
  );

  // Warning display
  const showWarning = useCallback(
    (message) => {
      setWarning(message);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningTimeoutRef.current = setTimeout(() => {
        setWarning("");
      }, warningDuration);
    },
    [warningDuration]
  );

  // Fullscreen handlers
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      handleViolation("FULLSCREEN_FAILED", "Could not enter fullscreen mode");
    }
  }, [handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );

    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && isExamActive && enableFullscreen) {
      handleViolation("FULLSCREEN_EXIT", "User exited fullscreen mode");
    }
  }, [isExamActive, enableFullscreen, handleViolation]);

  // Tab/Window focus handlers
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isExamActive && enableTabSwitch) {
      handleViolation("TAB_SWITCH", "User switched tabs or minimized window");
    }
  }, [isExamActive, enableTabSwitch, handleViolation]);

  const handleWindowBlur = useCallback(() => {
    if (isExamActive && enableTabSwitch) {
      handleViolation("WINDOW_BLUR", "Window lost focus");
    }
  }, [isExamActive, enableTabSwitch, handleViolation]);

  const handleWindowFocus = useCallback(() => {
    // Reset some tracking when window regains focus
    previousWindowSize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);

  // Mouse leave detection
  const handleMouseLeave = useCallback(
    (e) => {
      // Only trigger if mouse actually leaves the document
      if (
        isExamActive &&
        enableMouseLeave &&
        (e.clientY <= 0 ||
          e.clientX <= 0 ||
          e.clientX >= window.innerWidth ||
          e.clientY >= window.innerHeight)
      ) {
        handleViolation("MOUSE_LEAVE", "Mouse left the exam area");
      }
    },
    [isExamActive, enableMouseLeave, handleViolation]
  );

  // Right-click prevention
  const handleContextMenu = useCallback(
    (e) => {
      if (isExamActive && enableRightClick) {
        e.preventDefault();
        handleViolation("RIGHT_CLICK", "Attempted right-click");
      }
    },
    [isExamActive, enableRightClick, handleViolation]
  );

  // Keyboard restrictions
  const handleKeyDown = useCallback(
    (e) => {
      if (!isExamActive || !enableKeyboardRestrictions) return;

      const restrictedKeys = ["F12", "F5", "F11", "PrintScreen", "Insert"];

      const restrictedCombos = [
        { ctrl: true, key: "c" }, // Copy
        { ctrl: true, key: "v" }, // Paste
        { ctrl: true, key: "x" }, // Cut
        { ctrl: true, key: "a" }, // Select all
        { ctrl: true, key: "r" }, // Refresh
        { ctrl: true, key: "u" }, // View source
        { ctrl: true, key: "s" }, // Save
        { ctrl: true, key: "p" }, // Print
        { ctrl: true, key: "f" }, // Find
        { ctrl: true, key: "h" }, // History
        { ctrl: true, key: "j" }, // Downloads
        { ctrl: true, key: "n" }, // New window
        { ctrl: true, key: "t" }, // New tab
        { ctrl: true, key: "w" }, // Close tab
        { ctrl: true, shift: true, key: "i" }, // Dev tools
        { ctrl: true, shift: true, key: "j" }, // Console
        { ctrl: true, shift: true, key: "c" }, // Inspect
        { ctrl: true, shift: true, key: "k" }, // Console
        { alt: true, key: "Tab" }, // Alt+Tab
        { ctrl: true, key: "Tab" }, // Ctrl+Tab
      ];

      // Check restricted single keys
      if (restrictedKeys.includes(e.key)) {
        e.preventDefault();
        handleViolation("RESTRICTED_KEY", `Attempted to use ${e.key}`);
        return;
      }

      // Check restricted combinations
      for (const combo of restrictedCombos) {
        const ctrlMatch = combo.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = combo.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          const keys = [];
          if (combo.ctrl) keys.push("Ctrl");
          if (combo.shift) keys.push("Shift");
          if (combo.alt) keys.push("Alt");
          keys.push(combo.key.toUpperCase());
          handleViolation("RESTRICTED_COMBO", `Attempted ${keys.join("+")}`);
          return;
        }
      }
    },
    [isExamActive, enableKeyboardRestrictions, handleViolation]
  );

  // Copy/Paste prevention
  const handleCopy = useCallback(
    (e) => {
      if (isExamActive && enableCopyPaste) {
        e.preventDefault();
        e.clipboardData?.setData("text/plain", "");
        handleViolation("COPY_ATTEMPT", "Attempted to copy content");
      }
    },
    [isExamActive, enableCopyPaste, handleViolation]
  );

  const handlePaste = useCallback(
    (e) => {
      if (isExamActive && enableCopyPaste) {
        e.preventDefault();
        handleViolation("PASTE_ATTEMPT", "Attempted to paste content");
      }
    },
    [isExamActive, enableCopyPaste, handleViolation]
  );

  const handleCut = useCallback(
    (e) => {
      if (isExamActive && enableCopyPaste) {
        e.preventDefault();
        handleViolation("CUT_ATTEMPT", "Attempted to cut content");
      }
    },
    [isExamActive, enableCopyPaste, handleViolation]
  );

  // DevTools detection
  const detectDevTools = useCallback(() => {
    if (!isExamActive || !enableDevTools) return;

    const now = Date.now();
    if (now - lastDevToolsCheck.current < 500) return; // Throttle checks
    lastDevToolsCheck.current = now;

    // Method 1: Window size difference
    const threshold = 160;
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;

    if (heightDiff > threshold || widthDiff > threshold) {
      handleViolation(
        "DEV_TOOLS",
        `Developer tools detected (size diff: ${heightDiff}x${widthDiff})`
      );
      return;
    }

    // Method 2: Console detection
    let devtools = { open: false, orientation: null };
    const element = new Image();
    element.__defineGetter__("id", function () {
      devtools.open = true;
    });

    console.log(element);
    if (devtools.open) {
      handleViolation("DEV_TOOLS", "Console access detected");
      return;
    }

    // Method 3: Performance timing
    const start = performance.now();
    debugger; // This will pause if devtools is open
    const duration = performance.now() - start;
    if (duration > 100) {
      handleViolation("DEV_TOOLS", "Debugger detected");
    }
  }, [isExamActive, enableDevTools, handleViolation]);

  // Window resize detection
  const handleResize = useCallback(() => {
    if (!isExamActive) return;

    const currentSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const previousSize = previousWindowSize.current;

    const widthChange = Math.abs(currentSize.width - previousSize.width);
    const heightChange = Math.abs(currentSize.height - previousSize.height);

    // Allow small changes (mobile orientation, etc.)
    if (widthChange > 200 || heightChange > 200) {
      handleViolation(
        "WINDOW_RESIZE",
        `Significant window resize: ${widthChange}x${heightChange}px`
      );
    }

    previousWindowSize.current = currentSize;
  }, [isExamActive, handleViolation]);

  // Print prevention
  const handleBeforePrint = useCallback(() => {
    if (isExamActive) {
      handleViolation("PRINT_ATTEMPT", "Attempted to print page");
    }
  }, [isExamActive, handleViolation]);

  // Drag and drop prevention
  const handleDragStart = useCallback(
    (e) => {
      if (isExamActive) {
        e.preventDefault();
        handleViolation("DRAG_ATTEMPT", "Attempted to drag content");
      }
    },
    [isExamActive, handleViolation]
  );

  const handleDrop = useCallback(
    (e) => {
      if (isExamActive) {
        e.preventDefault();
        handleViolation("DROP_ATTEMPT", "Attempted to drop content");
      }
    },
    [isExamActive, handleViolation]
  );

  // Selection prevention
  const handleSelectStart = useCallback(
    (e) => {
      if (isExamActive && enableCopyPaste) {
        // Allow selection in input fields and textareas
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
      }
    },
    [isExamActive, enableCopyPaste]
  );

  // Start exam function
  const startExam = useCallback(async () => {
    try {
      setIsExamActive(true);
      setViolations([]);
      setIsBlocked(false);
      setWarning("");

      // Store initial window size
      previousWindowSize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      if (enableFullscreen) {
        await enterFullscreen();
      }

      if (enableDevTools) {
        // Start devtools detection with a slight delay
        setTimeout(() => {
          devToolsIntervalRef.current = setInterval(detectDevTools, 2000);
        }, 1000);
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Failed to start exam protection:", error);
      return Promise.reject(error);
    }
  }, [enableFullscreen, enableDevTools, enterFullscreen, detectDevTools]);

  // End exam function
  const endExam = useCallback(() => {
    setIsExamActive(false);

    if (devToolsIntervalRef.current) {
      clearInterval(devToolsIntervalRef.current);
      devToolsIntervalRef.current = null;
    }

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    // Exit fullscreen
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (
      document.webkitExitFullscreen &&
      document.webkitFullscreenElement
    ) {
      document.webkitExitFullscreen().catch(() => {});
    } else if (document.msExitFullscreen && document.msFullscreenElement) {
      document.msExitFullscreen().catch(() => {});
    }

    setWarning("");
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!isExamActive) return;

    const events = [
      // Fullscreen events
      ["fullscreenchange", handleFullscreenChange],
      ["webkitfullscreenchange", handleFullscreenChange],
      ["msfullscreenchange", handleFullscreenChange],

      // Visibility and focus events
      ["visibilitychange", handleVisibilityChange],
      ["blur", handleWindowBlur],
      ["focus", handleWindowFocus],

      // Mouse events
      ["mouseleave", handleMouseLeave],
      ["contextmenu", handleContextMenu],

      // Keyboard events
      ["keydown", handleKeyDown],

      // Clipboard events
      ["copy", handleCopy],
      ["paste", handlePaste],
      ["cut", handleCut],

      // Other events
      ["resize", handleResize],
      ["beforeprint", handleBeforePrint],
      ["dragstart", handleDragStart],
      ["drop", handleDrop],
      ["selectstart", handleSelectStart],
    ];

    // Add event listeners
    events.forEach(([event, handler]) => {
      if (event === "visibilitychange") {
        document.addEventListener(event, handler);
      } else {
        window.addEventListener(event, handler);
      }
    });

    // Cleanup function
    return () => {
      events.forEach(([event, handler]) => {
        if (event === "visibilitychange") {
          document.removeEventListener(event, handler);
        } else {
          window.removeEventListener(event, handler);
        }
      });
    };
  }, [
    isExamActive,
    handleFullscreenChange,
    handleVisibilityChange,
    handleWindowBlur,
    handleWindowFocus,
    handleMouseLeave,
    handleContextMenu,
    handleKeyDown,
    handleCopy,
    handlePaste,
    handleCut,
    handleResize,
    handleBeforePrint,
    handleDragStart,
    handleDrop,
    handleSelectStart,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (devToolsIntervalRef.current) {
        clearInterval(devToolsIntervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  // Return hook interface
  return {
    // State
    violations,
    violationCount,
    remainingViolations,
    isFullscreen,
    warning,
    isExamActive,
    isBlocked,

    // Actions
    startExam,
    endExam,
    triggerViolation,

    // Utilities
    enterFullscreen,
    showWarning,
  };
};

export default useAntiCheating;
