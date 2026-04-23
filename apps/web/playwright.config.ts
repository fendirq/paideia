import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { defineConfig } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "bun run dev",
    cwd: __dirname,
    port: 3000,
    reuseExistingServer: true,
  },
});
