import { db } from '../utils/drizzle';
import { pessoa } from "../db/schema"
import { desc, ilike } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const nome = query.nome;
  const pessoaID = query.id;
  const pessoaID2 = query.id2

  
  if(nome){ //pesquisa por nome
    return await db.select()
      .from(pessoa)
      .where(sql`${pessoa.nome} || ' ' || ${pessoa.sobrenome} like '%' || ${nome} || '%'`);
  }
  else if (pessoaID){
    if(pessoaID2){ //pesquisa conexão entre dois pontos
      const response = await db.execute(
        sql `SELECT * FROM twopoint_search(${pessoaID}::int, ${pessoaID2}::int)`
      )
      return response.rows
    }
    else{ //pesquisa árvore da pessoa
        const response = await db.execute(
            sql`SELECT * FROM tree_search(${pessoaID}::int)`
        )
        return response.rows
    }
  }

  return await db.select().from(pessoa).orderBy(desc(pessoa.id)); //retorna todos
});