import { sql } from "drizzle-orm";
import { pgTable, unique, check, index, text, serial, timestamp, varchar, char, date , integer, jsonb} from 'drizzle-orm/pg-core'

export const local = pgTable('Local', {
    id: serial().primaryKey(),
    descricao: varchar({length: 100})
});

export const pessoa = pgTable('Pessoa', {
  id: serial().primaryKey(),
  nome: varchar({length: 100}),
  sexo: char({length:1}),
  dataNasc: date(),
  localNasc: integer("localNasc_id").references(() => local.id),
  dataBatismo: date(),
  localBatismo: integer("localBatismo_id").references(() => local.id),
  dataMorte: date(),
  localMorte: integer("localMorte_id").references(() => local.id),
  obs: text(),
  creation_time: timestamp().notNull().defaultNow()
});

export const tipo_relacao = pgTable('Tipo_Relacao', {
    id: serial().primaryKey(),
    descricao: varchar({length: 100})
});

export const relacao = pgTable('Relacao', {
    id: serial().primaryKey(),
    p1: integer("p1_id").references(() => pessoa.id),
    p2: integer("p2_id").references(() => pessoa.id),
    rel: integer("rel_id").references(() => tipo_relacao.id),
    metadata: jsonb(),
    creation_time: timestamp().notNull().defaultNow()
}, (t) => [
  unique('p_unique').on(t.p1, t.p2),
  check('p_diff', sql`{$t.p1} <> {$t.p2}`),
  index("idx_relacao_p1").on(t.p1),
  index("idx_relacao_p2").on(t.p2)
]);