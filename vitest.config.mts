import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Ni UTC ni Bogotá: delata cualquier dependencia de la zona horaria del servidor.
    env: { TZ: "Asia/Tokyo" },
  },
});
