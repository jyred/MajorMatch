import { defineConfig } from "drizzle-kit";

// Supabase database URL
const databaseUrl = process.env.DATABASE_URL || 
  'postgresql://postgres:Yf7OOTKTbTzMnTQF@db.umblyjvtzjsokvjyhzyb.supabase.co:5432/postgres';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
