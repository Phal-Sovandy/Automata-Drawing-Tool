import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

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
    minify: "esbuild", // keep esbuild for speed
    target: "esnext",
    esbuild: {
      drop: ["console", "debugger"],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["framer-motion", "gsap"],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "gsap"],
  },
});
