import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pera Wallet's WalletConnect dependency still references Node's `global`.
// Alias only that identifier to the browser-native global object in both
// production bundles and Vite's development dependency pre-bundle.
const browserGlobalDefinition = {
  global: "globalThis",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: browserGlobalDefinition,
  optimizeDeps: {
    exclude: ["lucide-react"],
    esbuildOptions: {
      define: browserGlobalDefinition,
    },
  },
});
