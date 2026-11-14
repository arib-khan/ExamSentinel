// const redisClient = require("../config/radishRouter");

// const publisher = redisClient.duplicate();
// const subscriber = redisClient.duplicate();

// (async () => {
//   try {
//     await publisher.connect();
//     await subscriber.connect();
//     console.log("✅ Publisher & Subscriber Connected");
//   } catch (err) {
//     console.error("Redis Connection Error:", err);
//   }
// })();

// const connectedClients = {};
// const INACTIVITY_LIMIT = 30000;

// (async () => {
//   await subscriber.subscribe("exam_broadcast_channel", (message) => {
//     try {
//       const { examId, data } = JSON.parse(message);

//       if (connectedClients[examId]) {
//         Object.values(connectedClients[examId]).forEach((ws) => {
//           if (ws.readyState === ws.OPEN) {
//             ws.send(JSON.stringify(data));
//           }
//         });
//       }
//     } catch (e) {
//       console.error("Broadcast Parsing Error:", e);
//     }
//   });
// })();

// function handleSocketConnection(ws, studentId, examId) {
//   console.log(`🟢 Connected Student ${studentId} in Exam ${examId}`);

//   if (!connectedClients[examId]) connectedClients[examId] = {};
//   connectedClients[examId][studentId] = ws;

//   const statusKey = `exam_status:${studentId}`;
//   const usedKey = `exam_used:${studentId}`;

//   let connectionTimeout;
//   const resetConnectionTimeout = () => {
//     if (connectionTimeout) clearTimeout(connectionTimeout);
//     connectionTimeout = setTimeout(() => {
//       //   console.log(`⏰ Timeout: Student ${studentId}`);
//       ws.terminate();
//     }, INACTIVITY_LIMIT);
//   };
//   (async () => {
//     await redisClient.set(statusKey, "Active");
//     const exists = await redisClient.exists(usedKey);
//     if (!exists) {
//       await redisClient.set(usedKey, 0);
//     }
//   })();

//   ws.on("message", async (msg) => {
//     resetConnectionTimeout();
//     const message = msg.toString();

//     console.log("client message ", message, new Date().toLocaleTimeString());
//     if (message === "resume") {
//       await redisClient.set(statusKey, "Active");
//       ws.send(JSON.stringify({ type: "info", msg: "resumed" }));
//       return;
//     }

//     let obj = {};
//     try {
//       obj = JSON.parse(message);
//     } catch (e) {}

//     if (obj.status === "Active") {
//       const status = await redisClient.get(statusKey);
//       if (status !== "Submitted") {
//         const newTime = await redisClient.incrBy(usedKey, 10);
//         const mins = Math.floor(newTime / 60);
//         const secs = newTime % 60;
//         var formattedTime = `${mins}.${secs < 10 ? "0" + secs : secs}`;
//       }
//       ws.send(
//         JSON.stringify({
//           status: status,
//           usedTime: formattedTime,
//         })
//       );
//     }
//   });

//   ws.on("close", async () => {
//     console.log(`🔴 Student ${studentId} disconnected from Exam ${examId}`);
//     if (connectedClients[examId] && connectedClients[examId][studentId]) {
//       delete connectedClients[examId][studentId];
//       if (Object.keys(connectedClients[examId]).length === 0) {
//         delete connectedClients[examId];
//       }
//     }
//     const status = await redisClient.get(statusKey);
//     if (status !== "Submitted") {
//       await redisClient.set(statusKey, "Paused");
//     }
//   });
// }

// async function broadcastToExam(examId, message) {
//   console.log(`📢 Sending signal to all servers for Exam ${examId}`);
//   const liveUsersKey = `exam_live_users:${examId}`;
//   const onlineCount = await redisClient.sCard(liveUsersKey);
//   console.log("students count ", onlineCount);
//   await publisher.publish(
//     "exam_broadcast_channel",
//     JSON.stringify({
//       examId: examId,
//       data: message,
//     })
//   );

//   return onlineCount;
// }

// module.exports = { handleSocketConnection, broadcastToExam };

const redisClient = require("../config/radishRouter");

const publisher = redisClient.duplicate();
const subscriber = redisClient.duplicate();

(async () => {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log("✅ Publisher & Subscriber Connected");
  } catch (err) {
    console.error("Redis Connection Error:", err);
  }
})();

const connectedClients = {};
const INACTIVITY_LIMIT = 30000;

/* ================= SUBSCRIBER ================= */

(async () => {
  await subscriber.subscribe("exam_broadcast_channel", (message) => {
    try {
      const { examId, data } = JSON.parse(message);

      if (connectedClients[examId]) {
        Object.values(connectedClients[examId]).forEach((ws) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
          }
        });
      }
    } catch (e) {
      console.error("Broadcast Parsing Error:", e);
    }
  });
})();

/* ================= SOCKET CONNECTION ================= */

async function handleSocketConnection(ws, studentId, examId) {
  console.log(`🟢 Connected Student ${studentId} in Exam ${examId}`);

  if (!connectedClients[examId]) connectedClients[examId] = {};
  connectedClients[examId][studentId] = ws;

  /* 🔥 COUNT FIX — ADD STUDENT */
  await redisClient.sAdd(`exam_live_users:${examId}`, studentId);

  const statusKey = `exam_status:${studentId}`;
  const usedKey = `exam_used:${studentId}`;

  let connectionTimeout;
  const resetConnectionTimeout = () => {
    if (connectionTimeout) clearTimeout(connectionTimeout);
    connectionTimeout = setTimeout(() => {
      ws.terminate();
    }, INACTIVITY_LIMIT);
  };

  (async () => {
    await redisClient.set(statusKey, "Active");
    const exists = await redisClient.exists(usedKey);
    if (!exists) {
      await redisClient.set(usedKey, 0);
    }
  })();

  ws.on("message", async (msg) => {
    resetConnectionTimeout();
    const message = msg.toString();

    if (message === "resume") {
      await redisClient.set(statusKey, "Active");
      ws.send(JSON.stringify({ type: "info", msg: "resumed" }));
      return;
    }

    let obj = {};
    try {
      obj = JSON.parse(message);
    } catch (e) {}

    if (obj.status === "Active") {
      const status = await redisClient.get(statusKey);
      let formattedTime = "0.00";

      if (status !== "Submitted") {
        const newTime = await redisClient.incrBy(usedKey, 10);
        const mins = Math.floor(newTime / 60);
        const secs = newTime % 60;
        formattedTime = `${mins}.${secs < 10 ? "0" + secs : secs}`;
      }

      ws.send(
        JSON.stringify({
          status,
          usedTime: formattedTime,
        }),
      );
    }
  });

  ws.on("close", async () => {
    console.log(`🔴 Student ${studentId} disconnected from Exam ${examId}`);

    /* 🔥 COUNT FIX — REMOVE STUDENT */
    await redisClient.sRem(`exam_live_users:${examId}`, studentId);

    if (connectedClients[examId]?.[studentId]) {
      delete connectedClients[examId][studentId];
      if (Object.keys(connectedClients[examId]).length === 0) {
        delete connectedClients[examId];
      }
    }

    const status = await redisClient.get(statusKey);
    if (status !== "Submitted") {
      await redisClient.set(statusKey, "Paused");
    }
  });
}

/* ================= BROADCAST ================= */

async function broadcastToExam(examId, message) {
  console.log(`📢 Sending signal to all servers for Exam ${examId}`);

  const liveUsersKey = `exam_live_users:${examId}`;
  const onlineCount = await redisClient.sCard(liveUsersKey);

  await publisher.publish(
    "exam_broadcast_channel",
    JSON.stringify({
      examId,
      data: message,
    }),
  );

  return onlineCount;
}

module.exports = { handleSocketConnection, broadcastToExam };
