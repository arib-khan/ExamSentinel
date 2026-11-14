// // // let socket = null;

// // // export const connectExamSocket = (studentId, onMessage) => {
// // //   socket = new WebSocket(`${WebSocket_url}ws?studentId=${studentId}`);

// // //   socket.onopen = () => {
// // //     console.log("✅ Exam WebSocket connected");
// // //     // 🟢 NEW: Notify about connection status
// // //     onMessage({
// // //       type: "connection",
// // //       status: "connected",
// // //       usedInMin: 0,
// // //       remainingInMin: 0,
// // //     });
// // //   };

// // //   socket.onmessage = (event) => {
// // //     try {
// // //       const data = JSON.parse(event.data);
// // //       onMessage(data);
// // //     } catch {
// // //       if (event.data === "resumed") {
// // //         console.log("⏯️ Exam resumed via WebSocket");
// // //         // Handle resumed status
// // //         onMessage({
// // //           type: "status",
// // //           status: "active",
// // //           usedInMin: 0,
// // //           remainingInMin: 0,
// // //         });
// // //       }
// // //     }
// // //   };

// // //   socket.onclose = () => {
// // //     console.log("❌ WebSocket closed");
// // //     // 🔴 NEW: Notify about disconnection
// // //     onMessage({
// // //       type: "connection",
// // //       status: "disconnected",
// // //       usedInMin: 0,
// // //       remainingInMin: 0,
// // //     });
// // //   };

// // //   socket.onerror = (error) => {
// // //     console.error("❌ WebSocket error:", error);
// // //     // 🔴 NEW: Notify about connection error
// // //     onMessage({
// // //       type: "connection",
// // //       status: "error",
// // //       usedInMin: 0,
// // //       remainingInMin: 0,
// // //     });
// // //   };
// // // };

// // // export const sendSocketMessage = (msg) => {
// // //   if (socket && socket.readyState === WebSocket.OPEN) {
// // //     socket.send(msg);
// // //   } else {
// // //     console.warn("⚠️ WebSocket not connected, cannot send message:", msg);
// // //   }
// // // };

// // // export const closeExamSocket = () => {
// // //   if (socket) {
// // //     socket.close();
// // //     socket = null;
// // //   }
// // // };

// // // // 🟢 NEW: Helper function to get current connection status
// // // export const getSocketStatus = () => {
// // //   if (!socket) return "disconnected";

// // //   switch (socket.readyState) {
// // //     case WebSocket.CONNECTING:
// // //       return "connecting";
// // //     case WebSocket.OPEN:
// // //       return "connected";
// // //     case WebSocket.CLOSING:
// // //       return "closing";
// // //     case WebSocket.CLOSED:
// // //       return "disconnected";
// // //     default:
// // //       return "unknown";
// // //   }
// // // };

// // import { config, getConfig } from "@/config";
// // let socket = null;
// // let reconnectTimeout = null;
// // let reconnectInterval = 5000; // 5 seconds
// // let shouldReconnect = true; // Prevents reconnect if exam is over

// // // const WebSocket_url = import.meta.env.VITE_WEB_SOCKET_URL;
// // let WebSocket_url = null;

// // async function ensureSocketConfig() {
// //   if (!WebSocket_url) {
// //     await config.load();
// //     WebSocket_url = getConfig("VITE_WEB_SOCKET_URL"); // <-- from config.json
// //     console.log("Loaded WebSocket URL:", WebSocket_url);
// //   }
// // }

// // export const connectExamSocket = async (studentId, onMessage) => {
// //   await ensureSocketConfig();   // <-- LOAD CONFIG BEFORE USING IT

// //   if (!WebSocket_url) {
// //     console.error("❌ VITE_SOCKET_URL missing in config.json");
// //     return;
// //   }

// //   if (!studentId || typeof onMessage !== "function") return;

// //   // Avoid reconnecting if already connected
// //   if (socket && socket.readyState === WebSocket.OPEN) {
// //     console.log("🟢 Socket already connected");
// //     return;
// //   }

// //   // Skip reconnect if not allowed
// //   if (!shouldReconnect) {
// //     console.log("⛔ Reconnect disabled");
// //     return;
// //   }

// //   // Prevent reconnect flood while offline
// //   if (!navigator.onLine) {
// //     console.warn("⚠️ Offline: Skipping socket reconnect attempt");
// //     window.addEventListener(
// //       "online",
// //       () => connectExamSocket(studentId, onMessage),
// //       { once: true }
// //     );
// //     return;
// //   }

// //   // Clean up any existing socket
// //   if (socket) {
// //     socket.close();
// //     socket = null;
// //   }

// //   // Create a new WebSocket connection
// //   socket = new WebSocket(`${WebSocket_url}/ws?studentId=${studentId}`);

// //   socket.onopen = () => {
// //     console.log("✅ WebSocket connected");
// //     clearTimeout(reconnectTimeout);
// //     onMessage({
// //       type: "connection",
// //       status: "connected",
// //       usedInMin: 0,
// //       remainingInMin: 0,
// //     });
// //   };

// //   socket.onmessage = (event) => {
// //     try {
// //       const data = JSON.parse(event.data);
// //       onMessage(data);
// //     } catch {
// //       if (event.data === "resumed") {
// //         console.log("⏯️ Exam resumed via WebSocket");
// //         onMessage({
// //           type: "status",
// //           status: "active",
// //           usedInMin: 0,
// //           remainingInMin: 0,
// //         });
// //       }
// //     }
// //   };

// //   socket.onclose = () => {
// //     console.log("❌ WebSocket closed");

// //     onMessage({
// //       type: "connection",
// //       status: "disconnected",
// //       usedInMin: 0,
// //       remainingInMin: 0,
// //     });

// //     // 🔁 Schedule reconnect only if allowed
// //     if (shouldReconnect) {
// //       reconnectTimeout = setTimeout(() => {
// //         console.log("🔁 Attempting reconnect...");
// //         connectExamSocket(studentId, onMessage);
// //       }, reconnectInterval);
// //     }
// //   };

// //   socket.onerror = (error) => {
// //     console.error("❌ WebSocket error:", error);
// //     // Don't reconnect here — let `onclose` handle it
// //   };
// // };

// // // ✅ Send a message safely
// // export const sendSocketMessage = (msg) => {
// //   if (socket && socket.readyState === WebSocket.OPEN) {
// //     socket.send(msg);
// //   } else {
// //     console.warn("⚠️ WebSocket not connected, cannot send:", msg);
// //   }
// // };

// // // ❌ Cleanly close and stop future reconnects (e.g. after exam submission)
// // export const closeExamSocket = () => {
// //   shouldReconnect = false;
// //   clearTimeout(reconnectTimeout);
// //   if (socket) {
// //     socket.close();
// //     socket = null;
// //   }
// // };

// // // ✅ Helper to check current status
// // export const getSocketStatus = () => {
// //   if (!socket) return "disconnected";

// //   switch (socket.readyState) {
// //     case WebSocket.CONNECTING:
// //       return "connecting";
// //     case WebSocket.OPEN:
// //       return "connected";
// //     case WebSocket.CLOSING:
// //       return "closing";
// //     case WebSocket.CLOSED:
// //       return "disconnected";
// //     default:
// //       return "unknown";
// //   }
// // };

// // // 🟢 Restart connection manually if needed
// // export const restartExamSocket = (studentId, onMessage) => {
// //   shouldReconnect = true;
// //   connectExamSocket(studentId, onMessage);
// // };

// import { config, getConfig } from "@/config";

// let socket = null;
// let reconnectTimeout = null;
// let reconnectInterval = 5000; // 5 seconds
// let shouldReconnect = true;
// let reconnectAttempts = 0;
// let maxReconnectAttempts = 10; // Prevent infinite reconnects
// let WebSocket_url = null;

// async function ensureSocketConfig() {
//   if (!WebSocket_url) {
//     await config.load();
//     WebSocket_url = getConfig("VITE_WEB_SOCKET_URL");
//     console.log("Loaded WebSocket URL:", WebSocket_url);
//   }
// }

// export const connectExamSocket = async (studentId, onMessage) => {
//   await ensureSocketConfig();

//   if (!WebSocket_url) {
//     console.error("❌ VITE_SOCKET_URL missing in config.json");
//     return;
//   }

//   if (!studentId || typeof onMessage !== "function") return;

//   // Skip reconnect if not allowed
//   if (!shouldReconnect) {
//     console.log("⛔ Reconnect disabled");
//     return;
//   }

//   // Avoid reconnecting if already connected
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     console.log("🟢 Socket already connected");
//     return;
//   }

//   // Check reconnect attempts limit
//   if (reconnectAttempts >= maxReconnectAttempts) {
//     console.error(
//       `❌ Max reconnect attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`
//     );
//     onMessage({
//       type: "connection",
//       status: "error",
//       usedInMin: 0,
//       remainingInMin: 0,
//     });
//     return;
//   }

//   // **REMOVED navigator.onLine check for LAN compatibility**
//   // LAN networks may show as "offline" to the browser even when locally connected

//   // Clean up any existing socket
//   if (socket) {
//     // socket.close();
//     socket = null;
//   }

//   console.log(`🔄 Attempting to connect... (Attempt ${reconnectAttempts + 1})`);

//   // Notify connecting state
//   onMessage({
//     type: "connection",
//     status: "connecting",
//     usedInMin: 0,
//     remainingInMin: 0,
//   });

//   try {
//     // Create a new WebSocket connection
//     socket = new WebSocket(`${WebSocket_url}/ws?studentId=${studentId}`);

//     socket.onopen = () => {
//       console.log("✅ WebSocket connected");
//       reconnectAttempts = 0; // Reset counter on successful connection
//       clearTimeout(reconnectTimeout);

//       onMessage({
//         type: "connection",
//         status: "connected",
//         usedInMin: 0,
//         remainingInMin: 0,
//       });
//     };

//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         onMessage(data);
//         console.log(data, "log");

//       } catch {
//         if (event.data === "resumed") {
//           console.log("⏯️ Exam resumed via WebSocket");
//           onMessage({
//             type: "status",
//             status: "active",
//             usedInMin: 0,
//             remainingInMin: 0,
//           });
//         }
//       }
//     };

//     socket.onclose = (event) => {
//       console.log(`❌ WebSocket closed (Code: ${event.code}, Reason: ${event.reason})`);

//       onMessage({
//         type: "connection",
//         status: "disconnected",
//         usedInMin: 0,
//         remainingInMin: 0,
//       });

//       // 🔁 Schedule reconnect only if allowed
//       if (shouldReconnect) {
//         reconnectAttempts++;

//         // Exponential backoff: increase delay after each failed attempt
//         const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempts - 1), 30000);

//         console.log(`🔁 Scheduling reconnect in ${delay / 1000}s (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);

//         reconnectTimeout = setTimeout(() => {
//           connectExamSocket(studentId, onMessage);
//         }, delay);
//       }
//     };

//     socket.onerror = (error) => {
//       console.error("❌ WebSocket error:", error);

//       onMessage({
//         type: "connection",
//         status: "error",
//         usedInMin: 0,
//         remainingInMin: 0,
//       });

//       // Don't reconnect here — let `onclose` handle it
//     };
//   } catch (error) {
//     console.error("❌ Failed to create WebSocket:", error);

//     onMessage({
//       type: "connection",
//       status: "error",
//       usedInMin: 0,
//       remainingInMin: 0,
//     });

//     // Retry even if creation fails
//     if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
//       reconnectAttempts++;
//       const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempts - 1), 30000);

//       reconnectTimeout = setTimeout(() => {
//         connectExamSocket(studentId, onMessage);
//       }, delay);
//     }
//   }
// };

// // ✅ Send a message safely
// export const sendSocketMessage = (payload) => {
//   console.log(payload, "log");

//   if (socket && socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify(payload));
//     return true;
//   } else {
//     console.warn("⚠️ WebSocket not connected, cannot send:", payload);
//     return false;
//   }
// };

// // ❌ Cleanly close and stop future reconnects (e.g. after exam submission)
// export const closeExamSocket = () => {
//   console.log("🛑 Closing exam socket and disabling reconnection");
//   shouldReconnect = false;
//   reconnectAttempts = 0;
//   clearTimeout(reconnectTimeout);

//   if (socket) {
//     socket.close(1000, "Exam completed"); // Normal closure
//     socket = null;
//   }
// };

// // ✅ Helper to check current status
// export const getSocketStatus = () => {
//   if (!socket) return "disconnected";

//   switch (socket.readyState) {
//     case WebSocket.CONNECTING:
//       return "connecting";
//     case WebSocket.OPEN:
//       return "connected";
//     case WebSocket.CLOSING:
//       return "closing";
//     case WebSocket.CLOSED:
//       return "disconnected";
//     default:
//       return "unknown";
//   }
// };

// // 🟢 Restart connection manually if needed
// export const restartExamSocket = (studentId, onMessage) => {
//   console.log("🔄 Manual reconnection requested");
//   shouldReconnect = true;
//   reconnectAttempts = 0; // Reset attempts on manual retry
//   clearTimeout(reconnectTimeout);
//   connectExamSocket(studentId, onMessage);
// };

// // 🔍 Get connection info (useful for debugging)
// export const getConnectionInfo = () => {
//   return {
//     socketStatus: getSocketStatus(),
//     reconnectAttempts,
//     maxReconnectAttempts,
//     shouldReconnect,
//     WebSocket_url,
//   };
// };

// Enhanced examSocket.js with heartbeat timeout detection

import { config, getConfig } from "@/config";

let socket = null;
let reconnectTimeout = null;
let heartbeatTimeout = null; // NEW: Track missed heartbeats
let reconnectInterval = 5000;
let shouldReconnect = true;
let reconnectAttempts = 0;
let maxReconnectAttempts = 10;
let WebSocket_url = null;

// NEW: Configuration for heartbeat monitoring
const HEARTBEAT_INTERVAL = 10000; // 10 seconds (matches your interval)
const HEARTBEAT_TIMEOUT = 15000; // 25 seconds (allow 2 missed heartbeats + buffer)

async function ensureSocketConfig() {
  if (!WebSocket_url) {
    await config.load();
    WebSocket_url = getConfig("VITE_WEB_SOCKET_URL");
    console.log("Loaded WebSocket URL:", WebSocket_url);
  }
}

// NEW: Reset heartbeat timeout
const resetHeartbeatTimeout = (studentId, onMessage) => {
  // Clear existing timeout
  if (heartbeatTimeout) {
    clearTimeout(heartbeatTimeout);
  }

  // Set new timeout
  heartbeatTimeout = setTimeout(() => {
    console.warn(
      "⚠️ No heartbeat received from server - connection may be lost"
    );

    // Notify the UI about potential connection loss
    onMessage({
      type: "connection",
      status: "disconnected",
      usedInMin: 0,
      remainingInMin: 0,
    });

    // Force reconnection
    if (socket) {
      socket.close(4000, "Heartbeat timeout");
    }

    // Trigger reconnection
    if (shouldReconnect) {
      console.log("🔄 Attempting reconnection due to heartbeat timeout...");
      connectExamSocket(studentId, onMessage);
    }
  }, HEARTBEAT_TIMEOUT);
};

export const connectExamSocket = async (studentId, onMessage) => {
  await ensureSocketConfig();

  if (!WebSocket_url) {
    console.error("❌ VITE_SOCKET_URL missing in config.json");
    return;
  }

  if (!studentId || typeof onMessage !== "function") return;

  if (!shouldReconnect) {
    console.log("⛔ Reconnect disabled");
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("🟢 Socket already connected");
    return;
  }

  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error(
      `❌ Max reconnect attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`
    );
    onMessage({
      type: "connection",
      status: "error",
      usedInMin: 0,
      remainingInMin: 0,
    });
    return;
  }

  // **REMOVED navigator.onLine check for LAN compatibility**
  // LAN networks may show as "offline" to the browser even when locally connected
  // Clean up any existing socket

  if (socket) {
    //socket.close();
    //socket = null;
  }

  console.log(`🔄 Attempting to connect... (Attempt ${reconnectAttempts + 1})`);

  onMessage({
    type: "connection",
    status: "connecting",
    usedInMin: 0,
    remainingInMin: 0,
  });

  try {
    socket = new WebSocket(`${WebSocket_url}/ws?studentId=${studentId}`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectAttempts = 0;
      clearTimeout(reconnectTimeout);

      // NEW: Start heartbeat monitoring
      resetHeartbeatTimeout(studentId, onMessage);

      onMessage({
        type: "connection",
        status: "connected",
        usedInMin: 0,
        remainingInMin: 0,
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // NEW: Reset heartbeat timeout on every message received
        resetHeartbeatTimeout(studentId, onMessage);

        onMessage(data);
        // console.log("📨 Message received:", data);
      } catch {
        if (event.data === "resumed") {
          console.log("⏯️ Exam resumed via WebSocket");

          // NEW: Reset heartbeat on resume
          resetHeartbeatTimeout(studentId, onMessage);

          onMessage({
            type: "status",
            status: "active",
            usedInMin: 0,
            remainingInMin: 0,
          });
        }
      }
    };

    socket.onclose = (event) => {
      console.log(
        `❌ WebSocket closed (Code: ${event.code}, Reason: ${event.reason})`
      );

      // NEW: Clear heartbeat timeout
      if (heartbeatTimeout) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
      }

      onMessage({
        type: "connection",
        status: "disconnected",
        usedInMin: 0,
        remainingInMin: 0,
      });

      if (shouldReconnect) {
        reconnectAttempts++;

        const delay = Math.min(
          reconnectInterval * Math.pow(1.5, reconnectAttempts - 1),
          30000
        );

        console.log(
          `🔁 Scheduling reconnect in ${
            delay / 1000
          }s (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
        );

        reconnectTimeout = setTimeout(() => {
          connectExamSocket(studentId, onMessage);
        }, delay);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);

      // NEW: Clear heartbeat timeout on error
      if (heartbeatTimeout) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
      }

      onMessage({
        type: "connection",
        status: "error",
        usedInMin: 0,
        remainingInMin: 0,
      });
    };
  } catch (error) {
    console.error("❌ Failed to create WebSocket:", error);

    onMessage({
      type: "connection",
      status: "error",
      usedInMin: 0,
      remainingInMin: 0,
    });

    if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(
        reconnectInterval * Math.pow(1.5, reconnectAttempts - 1),
        30000
      );

      reconnectTimeout = setTimeout(() => {
        connectExamSocket(studentId, onMessage);
      }, delay);
    }
  }
};

export const sendSocketMessage = (payload) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return true;
  } else {
    console.warn("⚠️ WebSocket not connected, cannot send:", payload);
    return false;
  }
};

export const closeExamSocket = () => {
  console.log("🛑 Closing exam socket and disabling reconnection");
  shouldReconnect = false;
  reconnectAttempts = 0;

  // NEW: Clear heartbeat timeout
  if (heartbeatTimeout) {
    clearTimeout(heartbeatTimeout);
    heartbeatTimeout = null;
  }

  clearTimeout(reconnectTimeout);

  if (socket) {
    socket.close(1000, "Exam completed");
    socket = null;
  }
};

export const getSocketStatus = () => {
  if (!socket) return "disconnected";

  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "connected";
    case WebSocket.CLOSING:
      return "closing";
    case WebSocket.CLOSED:
      return "disconnected";
    default:
      return "unknown";
  }
};

export const restartExamSocket = (studentId, onMessage) => {
  console.log("🔄 Manual reconnection requested");
  shouldReconnect = true;
  reconnectAttempts = 0;

  // NEW: Clear heartbeat timeout
  if (heartbeatTimeout) {
    clearTimeout(heartbeatTimeout);
    heartbeatTimeout = null;
  }

  clearTimeout(reconnectTimeout);
  connectExamSocket(studentId, onMessage);
};

export const getConnectionInfo = () => {
  return {
    socketStatus: getSocketStatus(),
    reconnectAttempts,
    maxReconnectAttempts,
    shouldReconnect,
    WebSocket_url,
    hasActiveHeartbeat: heartbeatTimeout !== null, // NEW: Track heartbeat status
  };
};
