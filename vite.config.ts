import { defineConfig } from "vite";
import { remix } from "@pitlane/dev";
export default defineConfig({
  plugins: [remix()],
  css: {
    transformer: "lightningcss",
  },
});
