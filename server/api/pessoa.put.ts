import { db } from '../utils/drizzle';
import { pessoa, relacao } from "../db/schema"
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body.id ?? getRouterParam(event, 'id')

  try {
    const { id: _id, relacoes, ...camposPessoa } = body

    const updatedUser = await db.update(pessoa)
      .set(camposPessoa)
      .where(eq(pessoa.id, Number(id)))
      .returning()

    await updateRelations(Number(id), relacoes ?? [])

    return { success: true, data: updatedUser[0] }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }
})

interface Relacao { id?: number; p1?: number; p2: number; rel: number; metadata: any }

async function updateRelations(id: number, currentRelations: Relacao[]) {
  const previousRelations = await db.select().from(relacao).where(eq(relacao.p1, id))

  for (const r of currentRelations) {
    const foundIdx = previousRelations.findIndex(rel => rel.id === r.id)
    if (foundIdx !== -1) {
      // relação já existia — remove da lista de "a deletar"
      previousRelations.splice(foundIdx, 1)
    } else {
      // nova relação — cria no banco
      await db.insert(relacao).values({
        p1: id,
        p2: r.p2,
        rel: r.rel,
        metadata: r.metadata
      })
    }
  }

  // relações que não vieram no payload — deletar
  for (const r of previousRelations) {
    await db.delete(relacao).where(eq(relacao.id, r.id))
  }
}
