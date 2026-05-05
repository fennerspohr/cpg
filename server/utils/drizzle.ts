import pg from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";

// O Nuxt 3 prefere que usemos o process.env diretamente ou o runtimeConfig
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERRO: DATABASE_URL não encontrada no .env");
}

const pool = new pg.Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });