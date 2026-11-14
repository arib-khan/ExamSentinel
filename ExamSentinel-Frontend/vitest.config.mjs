import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Test-only config (the app's own vite.config.js is untouched). Run:  npx vitest run
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/__tests__/setup.js"], css: false, testTimeout: 30000, include: ["src/**/*.test.{js,jsx}"] },
});
