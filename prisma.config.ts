import { defineConfig } from "prisma/config";

// Next.js convention keeps secrets in .env.local; load it first
// (loadEnvFile never overwrites already-set variables), then .env.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent (e.g. CI) - fine
  }
}

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
