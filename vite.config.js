import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: "/psalmist/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Default port for Vite
    open: true, // Automatically open the browser when the server starts
  },
  build: {
    outDir: "docs", 
  },
});
