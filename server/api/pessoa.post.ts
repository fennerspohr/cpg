import { db } from '../utils/drizzle';
import { pessoa, relacao } from "../db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // 1. Cadastra a pessoa principal
  const [newPessoa] = await db.insert(pessoa).values({ 
    nome: body.nome,
    sobrenome: body.sobrenome,
    sexo: body.sexo,
    datanasc: body.datanasc || null,
    localnasc: body.localnasc || null,
    databatismo: body.databatismo || null,
    localbatismo: body.localbatismo || null,
    datamorte: body.datamorte || null,
    localmorte: body.localmorte || null,
    obs: body.obs || null
  }).returning();

  // Segurança: Se por algum motivo bizarro a pessoa não foi criada, para aqui
  if (!newPessoa || !newPessoa.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao gerar ID para a nova pessoa."
    });
  }

  // 2. Cadastra os vínculos (Relações)
  if (body.relacoes && Array.isArray(body.relacoes)) {
    for (const rel of body.relacoes) {
      // Garante que só vai tentar inserir se os dados mínimos existirem
      if (rel.p2 && rel.rel) {
       await db.insert(relacao).values({
  p1: newPessoa.id,
  p2: Number(rel.p2),
  rel: Number(rel.rel),
  metadata: rel.metadata ? JSON.parse(JSON.stringify(rel.metadata)) : null
});
      }
    }
  }
  
  return newPessoa;
});