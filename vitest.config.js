import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ["tests/api/**/*.test.js"],
          setupFiles: ["./tests/global.setup.js"],
          name: "api",
        },
      },
      {
        test: {
          include: ["tests/models/**/*.test.js"],
          setupFiles: ["./tests/global.setup.js"],
          name: "models",
        },
      },
    ],
  },
});