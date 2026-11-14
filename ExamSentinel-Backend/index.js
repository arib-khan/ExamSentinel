const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectRedis = require("connect-redis");
const redisClient = require("./config/radishRouter");
const WebSocket = require("ws");
const http = require("http");
const fileUpload = require("express-fileupload");
const { handleSocketConnection } = require("./sessionTracker/sessionTracker");

//const capturedata = require("./routes/Fingerprint");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const RedisStore = connectRedis(session);

// ✅ Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "exam-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  }),
);

// ✅ WebSocket connection

wss.on("connection", async (ws, req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const studentId = url.searchParams.get("studentId");
    const data = await redisClient.get(`student:${studentId}`);
    const student = JSON.parse(data);
    const examId = student.examId;

    if (!studentId) {
      ws.close(1008, "Student ID is required");
      return;
    }

    handleSocketConnection(ws, studentId, examId);
  } catch (err) {
    console.error("WebSocket error:", err);
    ws.close(1011, "Unexpected error");
  }
});

// ✅ Routes
app.get("/", (req, res) => {
  console.log(`Handled by worker: ${process.pid}`);
  res.json({ status: true, msg: "Online Exam server is Running 🚀" });
});

app.use("/api", require("./routes/ApiControler"));
app.use("/auth", require("./routes/utils/Auth"));

// ✅ Start server
server.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
