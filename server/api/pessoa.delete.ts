import { db } from '../utils/drizzle'
import { pessoa, relacao } from '../db/schema'
import { eq, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id   = Number(body.id)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório' })

  // Remove vínculos onde a pessoa é p1 ou p2 (FK sem cascade)
  await db.delete(relacao).where(or(eq(relacao.p1, id), eq(relacao.p2, id)))

  const deleted = await db.delete(pessoa).where(eq(pessoa.id, id)).returning()

  if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Pessoa não encontrada' })

  return { success: true, data: deleted[0] }
})
