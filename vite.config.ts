import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// runtime error overlay plugin removed for production build

export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay(),
    // Replit-only dev plugins removed for production/CJS build compatibility
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@server": path.resolve(import.meta.dirname, "server"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
