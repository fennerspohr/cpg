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

        const pessoas = response.rows[0].info
        const relacoes = response.rows[0].o_link_rel
        const p1 = response.rows[0].o_point1
        const p2 = response.rows[0].o_point2
        var data = []

        for(const p in pessoas ){
            var parents = []
            var spouses = []
            var children = []

            for(const [idx, value] of p1.entries()){
                if(value == pessoas[p].id && relacoes[idx] == 1){
                    parents.push(`"${p2[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 2){
                    spouses.push(`"${p2[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 3){
                    children.push(`"${p2[idx]}"`);
                }
            }

            for(const [idx, value] of p2.entries()){
                if(value == pessoas[p].id && relacoes[idx] == 1){
                    children.push(`"${p1[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 2){
                    spouses.push(`"${p1[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 3){
                    parents.push(`"${p1[idx]}"`);
                }
            }

            data.push(JSON.parse(`{"id": "${pessoas[p].id}",
                "rels": {"parents": [${parents.join(',')}],"spouses":[${spouses.join(',')}],"children":[${children.join(',')}]},
                "data":{
                    "gender": "${pessoas[p]['gender']}",
                    "first name": "${pessoas[p]['first name']}",
                    "last name": "${pessoas[p]['last name']}",
                    "birth year": "${pessoas[p]['birth year'] == null? " ": pessoas[p]['birth year']}",
                    "birth place": "${pessoas[p]['birth place'] ==  undefined? " ": pessoas[p]['birth place']}",
                    "death year": "${pessoas[p]['death year'] == null? " ": pessoas[p]['death year']}",
                    "death place": "${pessoas[p]['death place']  ==  undefined? " ": pessoas[p]['death place']}"}}`))
        }

        return ( data)
    }
    
})