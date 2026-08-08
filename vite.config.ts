import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pera Wallet uses WalletConnect v1, whose browser packages still depend on
// Node-style globals and mixed ESM/CommonJS entry points. Keep those details
// inside the build configuration rather than leaking polyfill logic into the UI.
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
    "process.env": "{}",
  },
  resolve: {
    alias: [
      { find: /^node:buffer$/, replacement: "buffer" },
      { find: /^node:crypto$/, replacement: "crypto-browserify" },
      { find: /^node:process$/, replacement: "process/browser" },
      { find: /^node:stream$/, replacement: "stream-browserify" },
      { find: "buffer", replacement: "buffer" },
      { find: "crypto", replacement: "crypto-browserify" },
      { find: "process", replacement: "process/browser" },
      { find: "stream", replacement: "stream-browserify" },
      {
        find: "@walletconnect/client",
        replacement: "@walletconnect/client/dist/esm/index.js",
      },
      {
        find: "@walletconnect/core",
        replacement: "@walletconnect/core/dist/esm/index.js",
      },
      {
        find: "@walletconnect/iso-crypto",
        replacement: "@walletconnect/iso-crypto/dist/esm/browser/index.js",
      },
      {
        find: "@walletconnect/utils",
        replacement: "@walletconnect/utils/dist/esm/index.js",
      },
    ],
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
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
