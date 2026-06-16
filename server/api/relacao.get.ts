import { db } from '../utils/drizzle'
import { relacao } from '../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const pessoaId = Number(query.id)

  if (!pessoaId) {
    throw createError({ statusCode: 400, statusMessage: 'id é obrigatório' })
  }

  return await db.select().from(relacao).where(eq(relacao.p1, pessoaId))
})
