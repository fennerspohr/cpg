// server/api/users/[id].put.ts
import { db } from '../utils/drizzle';
import { pessoa, relacao } from "../db/schema"
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  try {
    const updatedUser = await db.update(pessoa)
      .set(body)
      .where(eq(pessoa.id, Number(id)))
      .returning() // Optional: returns the updated record (Postgres/SQLite)
    
      await updateRelations(Number(id), body.relacoes);

    return { success: true, data: updatedUser[0] }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }
})

interface relacoes {id: number; p1: number; p2:number; rel:number; metadata:JSON}

async function updateRelations(id: number, curRel:relacoes[]){
  const previousRelations = await db.select().from(relacao).where(eq(relacao.p1, id));

  var currentRelations = curRel;

  for(const r of currentRelations){
    // verifica se relação existente na pessoa atualizada já existia
    const foundUser = previousRelations.find(rel => rel.id == r.id);

    //se sim
    if(foundUser){
      // remove essa relação da lista de relações prévias
      previousRelations.splice(previousRelations.findIndex(rel => rel.id = foundUser.id))
    }
    else{
      // cria as novas relações no banco
      await db.insert(relacao).values({
        p1:id,
        p2:r.p2,
        rel:r.rel,
        metadata:r.metadata
      });
    }
  }

  // percorre a lista de relações prévias que não estão presentes na pessoa atualizada
  for(const r of previousRelations){
    // deleta essas relações do banco
    await db.delete(relacao).where(eq(relacao.id, r.id)); 
  }
}
