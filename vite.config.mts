import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // if the repo is named romantic-proposal, this is correct:
  base: "/romantic-proposal/",
});
