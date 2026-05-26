import { db } from '../utils/drizzle';
import { tipoRelacao } from "../db/schema";
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    return await db.select().from(tipoRelacao).orderBy(asc(tipoRelacao.descricao));
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar tipos de relação: ' + err.message,
    });
  }
});