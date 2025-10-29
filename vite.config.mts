import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/prop/", // ✅ must match your repo name
  plugins: [react()],
});
