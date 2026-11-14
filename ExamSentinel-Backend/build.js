// const fs = require("fs-extra");
// const path = require("path");
// const esbuild = require("esbuild");

// async function build() {
//   await esbuild.build({
//     entryPoints: ["./index.js"],
//     bundle: true,
//     platform: "node",
//     target: ["node20"],
//     outfile: "dist/bundle.js",
//     minify: process.env.NODE_ENV === "production",
//     sourcemap: process.env.NODE_ENV !== "production",
//     external: ["bcrypt"], // keep bcrypt external
//   });

//   console.log("✅ Build completed successfully!");

//   // Copy config folder if needed
//   if (fs.existsSync("config")) {
//     fs.copySync("config", path.join("dist", "config"));
//     console.log("📂 Config folder copied");
//   }
// }

// build().catch(() => process.exit(1));

const fs = require("fs-extra");
const path = require("path");
const esbuild = require("esbuild");

async function build() {
  await esbuild.build({
    entryPoints: ["./index.js"],
    bundle: true,
    platform: "node",
    target: ["node20"],
    outfile: "dist/bundle.js",
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV !== "production",
    external: [
      "bcrypt",
      "./config/*", // ✅ exclude config files from bundle
    ],
  });

  console.log("✅ Build completed successfully!");

  // ✅ Copy config folder for deployment (optional use)
  if (fs.existsSync("config")) {
    fs.copySync("config", path.join("dist", "config"));
    console.log("📂 Config folder copied into dist/");
  }
}

build().catch(() => process.exit(1));
