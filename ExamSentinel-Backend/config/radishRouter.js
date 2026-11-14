const redis = require("redis");
const { exec } = require("child_process");
require("dotenv").config();

const redisPath = process.env.REDIS_PATH;
const redisConf = process.env.REDIS_CONF;

const command = `"${redisPath}" "${redisConf}"`;
//console.log("path", command);
exec(command, (err, stdout, stderr) => {
  if (err) {
    //console.error("❌ Redis start failed:", err.message);
  } else {
    console.log("✅ Redis server started");
    console.log("📄 stdout:", stdout);
    console.log("📄 stderr:", stderr);
  }
});

const redisClient = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Connected"));

if (typeof redisClient.connect === "function") {
  redisClient.connect();
}

module.exports = redisClient;
