import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ensures assets are built in a way compatible with OneSec's hosting
  build: {
    outDir: "dist",
    // Enables asset optimization
    assetsDir: "assets",
    // Improves caching and load times
    sourcemap: true,
    rollupOptions: {
      output: {
        // Helps with asset organization
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
  },
  },
});