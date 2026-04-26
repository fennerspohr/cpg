import { db } from '../utils/drizzle';
import { local } from "../db/schema"
import { desc, ilike } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const str = query.string;
  
  if(str){
    return await db.select()
      .from(local)
      .where(ilike(local.descricao, '%' + str + '%'));
  }
  return await db.select().from(local).orderBy(desc(local.id));
});