// const { exec } = require("child_process");
// const path = require("path");

// // Absolute path to the exe
// const exePath = path.join(__dirname, "FingerprintCapture.cs");

// exec(`"${exePath}"`, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error: ${error.message}`);
//     return;
//   }
//   if (stderr) {
//     console.error(`Stderr: ${stderr}`);
//     return;
//   }
//   console.log(`Output:\n${stdout}`);
// });
const { execFile } = require("child_process");
const path = require("path");

const exePath = path.join(__dirname, "FingerprintCapture.js");
console.log("Final Path:", exePath);

execFile(exePath, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Output:", stdout);
});
