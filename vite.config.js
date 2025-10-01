import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Use esbuild for minification (default, no terser needed)
    minify: "esbuild",
    target: "esnext",
    esbuild: {
      drop: ["console", "debugger"], // removes console.log + debugger in prod
    },
    // Enable chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["framer-motion", "gsap"],
        },
      },
    },
  },
  // SEO and performance optimizations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "gsap"],
  },
});
