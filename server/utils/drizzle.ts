import pg from 'pg';
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "../db/schema"

export { sql, eq, and, or, like } from 'drizzle-orm'

export const tables = schema

const sql =  process.env.DATABASE_URL!;

export const db = drizzle(sql, {schema});