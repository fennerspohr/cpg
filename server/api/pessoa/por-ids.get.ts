import { db } from '../../utils/drizzle'
import { pessoa } from '../../db/schema'
import { inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ids = String(query.ids ?? '').split(',').map(Number).filter(n => n > 0)
  if (!ids.length) return []
  return await db.select().from(pessoa).where(inArray(pessoa.id, ids))
})
