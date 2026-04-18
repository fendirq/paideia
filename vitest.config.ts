import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // `server-only` throws when imported under its default export
      // condition so client bundles fail at build. In tests we want
      // the `react-server` condition (empty.js, no throw) so
      // server-only modules are importable from vitest without each
      // test file needing to vi.mock the marker.
      "server-only": resolve(__dirname, "./node_modules/server-only/empty.js"),
    },
  },
});
