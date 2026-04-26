// server/api/users/[id].put.ts
import { db } from '../utils/drizzle';
import { pessoa } from "../db/schema"
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  try {
    const updatedUser = await db.update(pessoa)
      .set(body)
      .where(eq(pessoa.id, Number(id)))
      .returning() // Optional: returns the updated record (Postgres/SQLite)

    return { success: true, data: updatedUser[0] }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }
})
