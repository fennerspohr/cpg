import { sql } from "drizzle-orm";
import { pgTable, unique, check, index, text, serial, timestamp, varchar, char, date , integer, jsonb} from 'drizzle-orm/pg-core'

export const local = pgTable('local', {
    id: serial().primaryKey(),
    descricao: varchar({length: 100})
});

export const pessoa = pgTable('pessoa', {
  id: serial().primaryKey(),
  nome: varchar({length: 100}),
  sobrenome: varchar({length:100}),
  sexo: char({length:1}),
  datanasc: date(),
  localnasc: integer().references(() => local.id),
  databatismo: date(),
  localbatismo: integer().references(() => local.id),
  datamorte: date(),
  localmorte: integer().references(() => local.id),
  obs: text(),
  creation_time: timestamp().notNull().defaultNow()
});

export const tipo_relacao = pgTable('tipo_relacao', {
    id: serial().primaryKey(),
    descricao: varchar({length: 100})
});

export const relacao = pgTable('relacao', {
    id: serial().primaryKey(),
    p1: integer().references(() => pessoa.id),
    p2: integer().references(() => pessoa.id),
    rel: integer().references(() => tipo_relacao.id),
    metadata: jsonb(),
    creation_time: timestamp().notNull().defaultNow()
}, (t) => [
  unique('p_unique').on(t.p1, t.p2),
  check('p_diff', sql`{$t.p1} <> {$t.p2}`),
  index("idx_relacao_p1").on(t.p1),
  index("idx_relacao_p2").on(t.p2)
]);