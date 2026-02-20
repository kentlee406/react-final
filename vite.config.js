import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/react-week5/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 將常用第三方套件分包，降低單一 chunk 體積
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("bootstrap")) return "vendor-bootstrap";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-redux") || id.includes("@reduxjs/toolkit")) {
            return "vendor-redux";
          }
          if (id.includes("axios")) return "vendor-axios";

          return "vendor";
        },
      },
    },
  },
});
