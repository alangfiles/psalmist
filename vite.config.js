import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default port for Vite
    open: true, // Automatically open the browser when the server starts
  },
});