import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js convention keeps secrets in .env.local; load it first
// (dotenv never overwrites already-set variables), then .env.
loadEnv({ path: ".env.local" });
loadEnv();

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
