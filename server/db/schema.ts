import { pgTable, serial, varchar, char, date, text, timestamp, integer, jsonb, uniqueIndex, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const local = pgTable("local", {
  id: serial("id").primaryKey(),
  descricao: varchar("descricao", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 100 }),
});

export const tipoRelacao = pgTable("tipo_relacao", {
  id: serial("id").primaryKey(),
  descricao: varchar("descricao", { length: 100 }).notNull(),
});

export const pessoa = pgTable("pessoa", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  sobrenome: varchar("sobrenome", { length: 100 }).notNull(),
  sexo: char("sexo", { length: 1 }),
  datanasc: date("datanasc"),
  localnasc: integer("localnasc").references(() => local.id),
  databatismo: date("databatismo"),
  localbatismo: integer("localbatismo").references(() => local.id),
  datamorte: date("datamorte"),
  localmorte: integer("localmorte").references(() => local.id),
  obs: text("obs"),
  creationTime: timestamp("creation_time").defaultNow().notNull(),
});

export const relacao = pgTable("relacao", {
  id: serial("id").primaryKey(),
  p1: integer("p1").notNull().references(() => pessoa.id),
  p2: integer("p2").notNull().references(() => pessoa.id),
  rel: integer("rel").notNull().references(() => tipoRelacao.id),
  metadata: jsonb("metadata"), // O Casamento vive feliz aqui dentro!
  creationTime: timestamp("creation_time").defaultNow().notNull(),
}, (t) => [
  check("p_diff", sql`${t.p1} <> ${t.p2}`)
]);