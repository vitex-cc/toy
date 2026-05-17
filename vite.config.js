import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  publicDir: false,
  plugins: [vue()],
  build: {
    // Media is intentionally embedded as base64 so the app has no runtime asset fetches.
    chunkSizeWarningLimit: 3000,
  },
});
