import pg from 'pg';
import { defineConfig } from 'drizzle-kit';
import { drizzle } from "drizzle-orm/node-postgres";

export default defineConfig({
  dialect: 'postgresql', // or 'mysql' | 'sqlite'
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
// Tentamos ler do .env, se não existir, usamos a string baseada na sua imagem
const connectionString = process.env.DATABASE_URL || "postgres://postgres:1457@localhost:5432/cpg";

// const pool = new pg.Pool({
//   connectionString: connectionString,
// });

// export const db = drizzle(pool, { schema });
// export const tables = schema;