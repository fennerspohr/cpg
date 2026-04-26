import { db } from '../utils/drizzle';
import { pessoa, relacao } from "../db/schema"

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const [newPessoa] = await db.insert(pessoa).values({ 
    nome: body.nome,
    sobrenome:body.sobrenome,
    sexo: body.sexo,
    datanasc: body.datanasc,
    localnasc: body.localnasc,
    databatismo: body.databatismo,
    localbatismo: body.localbatismo,
    datamorte: body.datamorte,
    localmorte: body.localmorte,
    obs: body.obs
}).returning();
  for(const rel of body.relacoes){
    await db.insert(relacao).values({
        p1: newPessoa?.id,
        p2: rel.p2,
        rel: rel.rel,
        metadata: rel.metadata
    })
  };
  return newPessoa;
});