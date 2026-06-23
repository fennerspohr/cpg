CREATE SCHEMA "public";
CREATE SCHEMA "drizzle";
CREATE TABLE "local" (
	"id" serial PRIMARY KEY,
	"descricao" varchar(100) NOT NULL,
	"estado" varchar(100)
);
CREATE TABLE "pessoa" (
	"id" serial PRIMARY KEY,
	"nome" varchar(100) NOT NULL,
	"sexo" char(1),
	"datanasc" date,
	"localnasc" integer,
	"databatismo" date,
	"localbatismo" integer,
	"datamorte" date,
	"localmorte" integer,
	"obs" text,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"sobrenome" varchar(100) NOT NULL
);
CREATE TABLE "relacao" (
	"p1" integer NOT NULL UNIQUE,
	"p2" integer NOT NULL UNIQUE,
	"rel" integer NOT NULL,
	"metadata" jsonb,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY,
	CONSTRAINT "p_unique" UNIQUE("p1","p2"),
	CONSTRAINT "p_diff" CHECK ((p1 <> p2))
);
CREATE TABLE "tipo_relacao" (
	"id" serial PRIMARY KEY,
	"descricao" varchar(100) NOT NULL
);
CREATE TABLE "drizzle"."__drizzle_migrations" (
	"id" serial PRIMARY KEY,
	"hash" text NOT NULL,
	"created_at" bigint
);
CREATE UNIQUE INDEX "local_pkey" ON "local" ("id");
CREATE UNIQUE INDEX "pessoa_pkey" ON "pessoa" ("id");
CREATE INDEX "idx_relacao_p1" ON "relacao" ("p1");
CREATE INDEX "idx_relacao_p2" ON "relacao" ("p2");
CREATE UNIQUE INDEX "p_unique" ON "relacao" ("p1","p2");
CREATE UNIQUE INDEX "relacao_pkey" ON "relacao" ("id");
CREATE UNIQUE INDEX "tipo_relacao_pkey" ON "tipo_relacao" ("id");
CREATE UNIQUE INDEX "__drizzle_migrations_pkey" ON "drizzle"."__drizzle_migrations" ("id");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localbatismo_local_id_fk" FOREIGN KEY ("localbatismo") REFERENCES "local"("id");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localmorte_local_id_fk" FOREIGN KEY ("localmorte") REFERENCES "local"("id");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localnasc_local_id_fk" FOREIGN KEY ("localnasc") REFERENCES "local"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p1_pessoa_id_fk" FOREIGN KEY ("p1") REFERENCES "pessoa"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p2_pessoa_id_fk" FOREIGN KEY ("p2") REFERENCES "pessoa"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_rel_tipo_relacao_id_fk" FOREIGN KEY ("rel") REFERENCES "tipo_relacao"("id");

INSERT INTO "tipo_relacao" ("id", "descricao") VALUES (1, "MÃE/PAI"), (2, "CÔNJUGE"), (3, "FILHO/A");