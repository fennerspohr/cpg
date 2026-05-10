import { db } from '../utils/drizzle';
import { tipo_relacao } from "../db/schema";
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    return await db.select().from(tipo_relacao).orderBy(asc(tipo_relacao.descricao));
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar tipos de relação: ' + err.message,
    });
  }
});