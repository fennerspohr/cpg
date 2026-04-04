import pg from 'pg';
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "../db/schema"

export { sql, eq, and, or, like } from 'drizzle-orm'

export const tables = schema

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export function useDatabase() {
  return drizzle(pool, { schema })
}