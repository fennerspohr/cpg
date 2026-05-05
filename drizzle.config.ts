import pg from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";

// Tentamos ler do .env, se não existir, usamos a string baseada na sua imagem
const connectionString = process.env.DATABASE_URL || "postgres://postgres:1457@localhost:5432/cpg";

const pool = new pg.Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
export const tables = schema;