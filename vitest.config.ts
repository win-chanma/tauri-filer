import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    passWithNoTests: true,
    exclude: ["e2e/**", "node_modules/**"],
    alias: {
      "@xterm/xterm/css/xterm.css": path.resolve(__dirname, "src/__mocks__/@xterm/xterm-css.ts"),
      "@xterm/xterm": path.resolve(__dirname, "src/__mocks__/@xterm/xterm.ts"),
      "@xterm/addon-fit": path.resolve(__dirname, "src/__mocks__/@xterm/addon-fit.ts"),
    },
  },
});
