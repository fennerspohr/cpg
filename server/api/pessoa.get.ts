import { db } from '../utils/drizzle';
import { pessoa } from "../db/schema"
import { desc, eq, sql } from 'drizzle-orm';


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const nome = query.nome;
  const pessoaID = query.id;

  
  if(nome){ //pesquisa por nome
    return await db.select()
      .from(pessoa)
     .where(
        // ilike para busca ignorando maiúsculas/minúsculas
        sql`(${pessoa.nome} || ' ' || ${pessoa.sobrenome}) ilike ${'%' + nome + '%'}`
      );
  }
  else if (pessoaID){ //busca pessoa por id específico
    return await db.select()
    .from(pessoa)
    .where(eq(pessoa.id, Number(pessoaID)));
  }

  return await db.select().from(pessoa).orderBy(desc(pessoa.id)); //retorna todos
});