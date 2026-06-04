import { db } from '../utils/drizzle';
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const pessoaID = Number(query.id);
    const pessoaID2 = Number(query.id2)

if (pessoaID2) {
  const response = await db.execute(
    sql`SELECT * FROM parse_twopoint(${pessoaID}::int, ${pessoaID2}::int)`
  );

  const pessoas = response.rows[0].info as any[];
  const relacoes = response.rows[0].o_link_rel as number[];

  // Relationship codes (from your DB convention):
  // 1 = parent→child  (p1 is parent of p2)
  // 2 = spouse        (p1 is spouse of p2)
  // 3 = child→parent  (p1 is child of p2)
  // 5, 6 = "free" hops (same person / alias, zero depth cost — skip)

  if (!pessoas || pessoas.length === 0) return [];

  // Build a map for quick lookup: personId -> rels object
  const relsMap: Record<string, { parents: string[]; spouses: string[]; children: string[] }> = {};
  for (const p of pessoas) {
    relsMap[String(p.id)] = { parents: [], spouses: [], children: [] };
  }

  // Walk consecutive pairs in the path
  for (let i = 0; i < pessoas.length - 1; i++) {
    const fromId = String(pessoas[i].id);
    const toId   = String(pessoas[i + 1].id);
    const rel    = relacoes[i];

switch (rel) {
  case 1: // from is child of to
    if (!relsMap[fromId].parents.includes(toId))
      relsMap[fromId].parents.push(toId);
    if (!relsMap[toId].children.includes(fromId))
      relsMap[toId].children.push(fromId);
    break;

  case 2: // spouses
    if (!relsMap[fromId].spouses.includes(toId))
      relsMap[fromId].spouses.push(toId);
    if (!relsMap[toId].spouses.includes(fromId))
      relsMap[toId].spouses.push(fromId);
    break;

  case 3: // from is parent of to
    if (!relsMap[fromId].children.includes(toId))
      relsMap[fromId].children.push(toId);
    if (!relsMap[toId].parents.includes(fromId))
      relsMap[toId].parents.push(fromId);
    break;

  // cases 5 & 6: zero-cost hops, no relationship edge to record
}
  }

  // Shape into family-chart format
const data = pessoas.map((p, index) => ({
  id: String(p.id),
  rels: relsMap[String(p.id)],
  data: {
    gender:       p.gender      ?? '',
    'first name': p['first name'] ?? '',
    'last name':  p['last name']  ?? '',
    'birth year': p['birth year'] != null ? String(p['birth year']) : ' ',
    'death year': p['death year'] != null ? String(p['death year']) : ' ',
  },
}));

return data;
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
                if(value == pessoas[p].id && relacoes[idx] == 1 && !children.includes(`"${p1[idx]}"`)){
                    children.push(`"${p1[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 2 && !spouses.includes(`"${p1[idx]}"`)){
                    spouses.push(`"${p1[idx]}"`);
                }
                else if(value == pessoas[p].id && relacoes[idx] == 3 && !parents.includes(`"${p1[idx]}"`)){
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
                    "death year": "${pessoas[p]['death year'] == null? " ": pessoas[p]['death year']}"}}`))

    
}
        return ( data)
}
})