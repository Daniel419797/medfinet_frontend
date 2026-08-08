import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pera Wallet and Algorand SDK depend on Node-style globals and core modules.
// These aliases keep the production bundle browser-safe without exposing any
// backend secrets or requiring a separate frontend feature flag.
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
      crypto: "crypto-browserify",
      process: "process/browser",
      stream: "stream-browserify",
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "@perawallet/connect",
      "algosdk",
      "buffer",
      "crypto-browserify",
      "process",
      "stream-browserify",
    ],
  },
});
