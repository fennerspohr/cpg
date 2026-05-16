import { db } from '../utils/drizzle';
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const pessoaID = Number(query.id);
    const pessoaID2 = Number(query.id2)

    if(pessoaID2){
        const response = await db.execute(
            sql `SELECT * FROM twopoint_search(${pessoaID}::int, ${pessoaID2}::int)`
        )
        return response.rows
    }
    else{
        const response = await db.execute(
            sql`SELECT * FROM parse_tree(${pessoaID})`
        )

    }
    
})