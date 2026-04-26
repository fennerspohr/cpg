import { db } from '../utils/drizzle';
import { local } from "../db/schema"

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const [newLocal] = await db.insert(local).values({ descricao: body.descricao }).returning();
  return newLocal;
});