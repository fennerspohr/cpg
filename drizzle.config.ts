import 'dotenv/config'; // or import dotenv from 'dotenv'; dotenv.config();
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql', // or 'mysql' | 'sqlite'
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
