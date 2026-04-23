import { db } from '../utils/drizzle';
import { pessoa } from "../db/schema"
import { desc, ilike } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const nome = query.nome;
  const pessoaID = query.id;
  const tipo = query.tipo
  
  if(nome){
    return await db.select()
      .from(pessoa)
      .where(sql`${pessoa.nome} || ' ' || ${pessoa.sobrenome} like '%' || ${nome} || '%'`);
  }
  else if (pessoaID){
    console.log('oi')
    if(tipo == 'tree'){
        console.log('oi2')
        const response = await db.execute(
            sql`SELECT * FROM tree_search(${pessoaID}::int)`
        )
        console.log(response)
        return response.rows[0]
    }
  }
  console.log('oi3')
  return await db.select().from(pessoa).orderBy(desc(pessoa.id));
});