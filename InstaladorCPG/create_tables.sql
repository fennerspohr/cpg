CREATE SCHEMA "drizzle";
CREATE TABLE "local" (
	"id" serial PRIMARY KEY,
	"descricao" varchar(255) NOT NULL,
	"estado" varchar(100)
);
CREATE TABLE "pessoa" (
	"id" serial PRIMARY KEY,
	"nome" varchar(255) NOT NULL,
	"sexo" char(1),
	"datanasc" date,
	"localnasc" integer,
	"databatismo" date,
	"localbatismo" integer,
	"datamorte" date,
	"localmorte" integer,
	"obs" text,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	"sobrenome" varchar(255) NOT NULL
);
CREATE TABLE "relacao" (
	"p1" integer NOT NULL,
	"p2" integer NOT NULL,
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
CREATE INDEX "idx_relacao_p1" ON "relacao" ("p1");
CREATE INDEX "idx_relacao_p2" ON "relacao" ("p2");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localbatismo_local_id_fk" FOREIGN KEY ("localbatismo") REFERENCES "local"("id");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localmorte_local_id_fk" FOREIGN KEY ("localmorte") REFERENCES "local"("id");
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localnasc_local_id_fk" FOREIGN KEY ("localnasc") REFERENCES "local"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p1_pessoa_id_fk" FOREIGN KEY ("p1") REFERENCES "pessoa"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p2_pessoa_id_fk" FOREIGN KEY ("p2") REFERENCES "pessoa"("id");
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_rel_tipo_relacao_id_fk" FOREIGN KEY ("rel") REFERENCES "tipo_relacao"("id");

INSERT INTO "tipo_relacao" ("id", "descricao") VALUES (1, 'MAE/PAI'), (2, 'CONJUGE'), (3, 'FILHO/A');

create or replace function tree_search(      
  IN i_root int,                       -- The node that the search is based on        
  IN i_depth int  default 99999,       -- the tier to search (the depth limit)      
  IN i_limit int8 default 2000000000,  -- limit the number of records returned for each tier      
  OUT o_path int[],                    -- output: path, an array of IDs      
  OUT o_point1 int,                    -- output: point 1 ID      
  OUT o_point2 int,                    -- output: point 2 ID      
  OUT o_link_rel int,              -- output: the connection property between the two current points      
  OUT o_link_rel_all text,            -- output: the connection property from the starting node to the current node      
  OUT o_depth int                      -- output: current depth (tier)      
) returns setof record as 
$$
      
declare      
  sql text;      
begin      
sql := format($_$      
WITH RECURSIVE search_graph(        
  p1,     -- point 1        
  p2,     -- point 2        
  rel,   -- current edge property      
  all_rel,  -- properties of all edges  
  depth,  -- current depth, starting from 1         
  path    -- path, stored as an array         
) AS (        
        select p1,p2,rel,all_rel,depth,path from (        
        SELECT                               -- ROOT node query        
          g.p1,                              -- point 1        
          g.p2,                              -- point 2        
          g.rel,                            -- edge property        
      g.rel::text as all_rel,          -- properties of all edges  
          CASE 
            WHEN g.rel = 6 or g.rel = 5 THEN 0                            -- initial depth=1        
            ELSE 1
          END AS depth,
          ARRAY[g.p1, g.p2] path             -- initial path        
        FROM relacao AS g         
        WHERE         
          p1 = %s                            -- ROOT node=?        
          limit %s                           -- How many records are limited at each tier?        
        ) t        
      UNION ALL        
        select p1,p2,rel,all_rel,depth,path from (        
        SELECT                               -- recursive clause         
          g.p1,                              -- point 1        
          g.p2,                              -- point 2        
          g.rel,                            -- edge property     
      sg.all_rel || g.rel::text as all_rel,    -- properties of all edges  
          CASE
            WHEN g.rel = 6 or g.rel = 5 THEN sg.depth
            ELSE sg.depth + 1
          END AS depth,                   -- depth +1        
          sg.path || g.p2 path                 -- Add a new point to the path        
        FROM relacao AS g, search_graph AS sg    -- circular INNER JOIN        
        WHERE         
          g.p1 = sg.p2                       -- recursive JOIN condition        
          AND (g.p2 <> ALL(sg.path))                      -- Prevent loop, determine whether it is a loop and judge if the new point is already in the previous path   
          AND sg.depth <= %s                 -- search depth =?          
          limit %s                           -- How many records are limited at each tier?       
        ) t        
)        
SELECT path as o_path, p1 as o_point1, p2 as o_point2, rel as o_link_rel, all_rel as o_link_rel_all, depth as o_depth      
FROM search_graph;                           -- query a recursive table. You can add LIMIT output or use a cursor       
$_$, i_root, i_limit, i_depth, i_limit      
);      
return query execute sql;      
      
end;      

$$
 language plpgsql strict;   


-- 3.  Define the shortest path between two points. For example, 
-- search for the relationship between family members A and B 
-- When the relationship exceeds the N tier, no results are returned 
-- to avoid long-time searches. (We can also define a timeout statement 
-- to exit from the search when the execution exceeds N seconds.)

create or replace function twopoint_search(      
  IN i_p1 int,                       -- point 1        
  IN i_p2 int,                       -- point 2        
  IN i_depth int  default 99999,     -- the tier to search (the depth limit)        
  OUT o_path int[],                    -- output: path, an array of IDs      
  OUT o_link_rel text,                -- output: the connection property between the two current points      
  OUT o_depth int                      -- output: current depth (tier)      
) returns record as 
$$
      
declare      
  sql text;      
begin      
sql := format($_$      
WITH RECURSIVE search_graph(        
  p1,   -- point 1        
  p2,   -- point 2        
  rel, -- edge property        
  depth, -- depth, starting from 1        
  path  -- path, stored using an array            
) AS (        
        SELECT    -- ROOT node query        
          g.p1,   -- point 1        
          g.p2,   -- point 2        
          g.rel::text,   -- edge property        
          CASE 
            WHEN g.rel = 6 or g.rel = 5 THEN 0                            -- initial depth=1        
            ELSE 1
          END AS depth,      
          ARRAY[g.p1, g.p2] path             -- initial path        
        FROM relacao AS g         
        WHERE         
          p1 = %s         -- ROOT node =?      -- (the start of the shortest path)        
      UNION ALL        
        SELECT     -- recursive clause        
          g.p1,    -- point 1        
          g.p2,    -- point 2        
          sg.rel::text || g.rel::text,          -- edge property        
          CASE
            WHEN g.rel = 6 or g.rel = 5 THEN sg.depth
            ELSE sg.depth + 1
          END AS depth,                   -- depth +1         
          sg.path || g.p2 path                 -- Add a new point to the path      
        FROM relacao AS g, search_graph AS sg   -- circular INNER JOIN        
        WHERE         
          g.p1 = sg.p2         -- recursive JOIN condition        
          AND (g.p2 <> ALL(sg.path))        -- Prevent loop, determine whether it is a loop and judge if the new point is already in the previous path          
          AND sg.depth <= %s    -- search depth =?        
    
)        
SELECT      
  path as o_path,    
  rel as o_link_rel,    
  depth as o_depth    
FROM search_graph        
  where p2 = %s   -- the end of the shortest path        
  limit 1         -- query a recursive table. You can add LIMIT output or use a cursor        
$_$, i_p1, i_depth, i_p2);    
    
execute sql into o_path,o_link_rel,o_depth;    
return;    
end;    

$$
 language plpgsql strict;
 
 -- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION twoway_relation()
RETURNS TRIGGER AS $$
DECLARE 
    current_rel INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM relacao 
                    WHERE p1 = NEW.p2 AND p2 = NEW.p1) THEN
        IF(NEW.rel = 1) THEN
            current_rel = 3;
        ELSIF(NEW.rel = 2) THEN
            current_rel = 2;
        ELSIF(NEW.rel = 3) THEN
            current_rel = 1;
        ELSE
            current_rel = 0;
        END IF;

        INSERT INTO relacao (p1, p2, rel, metadata)
        VALUES (NEW.p2, NEW.p1, current_rel, NEW.metadata);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tgr_twoway_relation
AFTER INSERT ON relacao
FOR EACH ROW
EXECUTE FUNCTION twoway_relation();    

create or replace function parse_tree(
  IN i_root int,                       -- The node that the search is based on        
  IN i_depth int  default 99999,       -- the tier to search (the depth limit)      
  IN i_limit int8 default 2000000000,  -- limit the number of records returned for each tier 
  OUT info JSONB,
  OUT o_point1 int[],
  OUT o_point2 int[],
  OUT o_link_rel int[]
)
returns record
language plpgsql
as $$
declare
  ids int[];
  x int;
  obj jsonb;
begin
-- Initialize output
    info := '[]'::jsonb;
select array_agg(t.o_point1), array_agg(t.o_point2), array_agg(t.o_link_rel) into o_point1, o_point2, o_link_rel from tree_search(i_root, i_depth, i_limit) t;

SELECT array_agg(DISTINCT id)
    INTO ids
    FROM (
        SELECT unnest(o_point1) AS id
        UNION
        SELECT unnest(o_point2) AS id
    ) AS combined_ids;

foreach x in array ids loop
  select jsonb_build_object(
    'id', id,
    'first name', nome,
    'last name', sobrenome,
    'gender', sexo,
    'death year', date_part('year', datamorte),
    'birth year', date_part('year', datanasc)
  ) into obj from Pessoa
  where pessoa.id = x;

        IF obj IS NOT NULL THEN
            info := info || obj;
        END IF;
end loop;
end;
$$;

CREATE OR REPLACE FUNCTION parse_twopoint(
    IN i_p1 int,
    IN i_p2 int,
    IN i_depth int default 99999,
    OUT info JSONB,
    OUT o_link_rel int[]
) returns record language plpgsql as $$ 
declare
    v_path int[];
    v_link_rel_text text;
    v_depth int;
begin
    -- Inicializa os valores padrão de saída
    info := '[]'::jsonb;
    o_link_rel := '{}'::int[];

    -- 1. Executa a busca e captura o caminho (array) e as relações (texto colado)
    SELECT t.o_path, t.o_link_rel, t.o_depth 
    INTO v_path, v_link_rel_text, v_depth
    FROM twopoint_search(i_p1, i_p2, i_depth) t;

    -- 2. Se não encontrou caminho, encerra a execução mais cedo
    IF v_path IS NULL OR array_length(v_path, 1) = 0 THEN
        RETURN;
    END IF;

    -- 3. Transforma a string de texto em array de inteiros, caractere por caractere
    -- Exemplo: '651' vira '{6,5,1}'
    o_link_rel := string_to_array(v_link_rel_text, NULL)::int[];

    -- 4. Busca os dados da tabela Pessoa mantendo ESTREITAMENTE a ordem do v_path
    SELECT 
        COALESCE(JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'id', p.id,
                'first name', p.nome,
                'last name', p.sobrenome,
                'gender', p.sexo,
                'death year', date_part('year', p.datamorte),
                'birth year', date_part('year', p.datanasc)
            ) ORDER BY path_ids.ord -- Garante que o JSON respeite a ordem do array de IDs
        ), '[]'::jsonb)
    INTO 
        info
    FROM UNNEST(v_path) WITH ORDINALITY AS path_ids(id, ord)
    JOIN Pessoa p ON p.id = path_ids.id;

end; 
$$;

-- Concede ao usuario da aplicacao (cpg) permissao total sobre as tabelas,
-- sequences e funcoes, ja que elas foram criadas pelo superusuario (postgres)
-- e por padrao o owner das tabelas eh quem executou o CREATE TABLE, nao o
-- owner do banco.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cpg;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cpg;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO cpg;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA drizzle TO cpg;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA drizzle TO cpg;
GRANT USAGE ON SCHEMA public TO cpg;
GRANT USAGE ON SCHEMA drizzle TO cpg;

-- Garante que tabelas/sequences criadas no FUTURO (ex: novas migrations)
-- tambem ja nasçam com permissao para o cpg, sem precisar rodar GRANT de novo
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cpg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cpg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO cpg;