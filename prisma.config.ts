import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env (not the env() helper) so `prisma generate` works
    // without a database URL, e.g. in CI type-check runs.
    url: process.env.DATABASE_URL ?? "",
  },
});
