import { db } from '../utils/drizzle';
import { pessoa } from "../db/schema";
import { desc, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const busca = query.nome as string;
  const pessoaID = query.id;
  const pessoaID2 = query.id2;

  if (busca) {
    if (/^\d+$/.test(busca)) {
      return await db.select()
        .from(pessoa)
        .where(sql`${pessoa.id} = ${parseInt(busca)}`);
    }

    return await db.select()
      .from(pessoa)
      .where(
        sql`(${pessoa.nome} || ' ' || ${pessoa.sobrenome}) ilike ${'%' + busca + '%'}`
      )
      .orderBy(desc(pessoa.id));
  }

  else if (pessoaID) {
    if (pessoaID2) {
      const response = await db.execute(
        sql`SELECT * FROM twopoint_search(${pessoaID}::int, ${pessoaID2}::int)`
      );
      return response.rows;
    } else {
      const depth = query.depth ? Number(query.depth) : 99999
      const response = await db.execute(
        sql`SELECT * FROM tree_search(${pessoaID}::int, ${depth}::int)`
      );
      return response.rows;
    }
  }

  // 3. Retorno padrão
  return await db.select().from(pessoa).orderBy(desc(pessoa.id));
});