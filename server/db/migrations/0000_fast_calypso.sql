CREATE TABLE "local" (
	"id" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "pessoa" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100),
	"sobrenome" varchar(100),
	"sexo" char(1),
	"datanasc" date,
	"localnasc" integer,
	"databatismo" date,
	"localbatismo" integer,
	"datamorte" date,
	"localmorte" integer,
	"obs" text,
	"creation_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"p1" integer,
	"p2" integer,
	"rel" integer,
	"metadata" jsonb,
	"creation_time" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "p_unique" UNIQUE("p1","p2"),
	CONSTRAINT "p_diff" CHECK ({$t.p1} <> {$t.p2})
);
--> statement-breakpoint
CREATE TABLE "tipo_relacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(100)
);
--> statement-breakpoint
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localnasc_local_id_fk" FOREIGN KEY ("localnasc") REFERENCES "public"."local"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localbatismo_local_id_fk" FOREIGN KEY ("localbatismo") REFERENCES "public"."local"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_localmorte_local_id_fk" FOREIGN KEY ("localmorte") REFERENCES "public"."local"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p1_pessoa_id_fk" FOREIGN KEY ("p1") REFERENCES "public"."pessoa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_p2_pessoa_id_fk" FOREIGN KEY ("p2") REFERENCES "public"."pessoa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relacao" ADD CONSTRAINT "relacao_rel_tipo_relacao_id_fk" FOREIGN KEY ("rel") REFERENCES "public"."tipo_relacao"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_relacao_p1" ON "relacao" USING btree ("p1");--> statement-breakpoint
CREATE INDEX "idx_relacao_p2" ON "relacao" USING btree ("p2");

--1.  Search for a family member's N-tier relationship data and specify the limit 
-- on the records per tier. (Generally the volume of family data is not very large. 
-- Therefore we can simply limit the tier. It does not even matter if all results for
-- each tier are returned.)
create or replace function tree_search(      
  IN i_root int,                       -- The node that the search is based on        
  IN i_depth int  default 99999,       -- the tier to search (the depth limit)      
  IN i_limit int8 default 2000000000,  -- limit the number of records returned for each tier      
  OUT o_path int[],                    -- output: path, an array of IDs      
  OUT o_point1 int,                    -- output: point 1 ID      
  OUT o_point2 int,                    -- output: point 2 ID      
  OUT o_link_rel int2,              -- output: the connection property between the two current points      
  OUT o_link_rel_all text,            -- output: the connection property from the starting node to the current node      
  OUT o_depth int                      -- output: current depth (tier)      
) returns setof record as 
$$
      
declare      
  sql text;      
begin      
sql := format($_$      
WITH RECURSIVE search_graph(        
  c1,     -- point 1        
  c2,     -- point 2        
  rel,   -- current edge property      
  all_rel,  -- properties of all edges  
  depth,  -- current depth, starting from 1         
  path    -- path, stored as an array         
) AS (        
        select c1,c2,rel,all_rel,depth,path from (        
        SELECT                               -- ROOT node query        
          g.c1,                              -- point 1        
          g.c2,                              -- point 2        
          g.rel,                            -- edge property        
      g.rel::text as all_rel,          -- properties of all edges  
          CASE 
            WHEN g.rel = 6 or g.rel = 5 THEN 0                            -- initial depth=1        
            ELSE 1
          END AS depth,
          ARRAY[g.c1, g.c2] path             -- initial path        
        FROM tbl_er AS g         
        WHERE         
          c1 = %s                            -- ROOT node=?        
          limit %s                           -- How many records are limited at each tier?        
        ) t        
      UNION ALL        
        select c1,c2,rel,all_rel,depth,path from (        
        SELECT                               -- recursive clause         
          g.c1,                              -- point 1        
          g.c2,                              -- point 2        
          g.rel,                            -- edge property     
      sg.all_rel || g.rel::text as all_rel,    -- properties of all edges  
          CASE
            WHEN g.rel = 6 or g.rel = 5 THEN sg.depth
            ELSE sg.depth + 1
          END AS depth,                   -- depth +1        
          sg.path || g.c2 path                 -- Add a new point to the path        
        FROM tbl_er AS g, search_graph AS sg    -- circular INNER JOIN        
        WHERE         
          g.c1 = sg.c2                       -- recursive JOIN condition        
          AND (g.c2 <> ALL(sg.path))                      -- Prevent loop, determine whether it is a loop and judge if the new point is already in the previous path   
          AND sg.depth <= %s                 -- search depth =?          
          limit %s                           -- How many records are limited at each tier?       
        ) t        
)        
SELECT path as o_path, c1 as o_point1, c2 as o_point2, rel as o_link_rel, all_rel as o_link_rel_all, depth as o_depth      
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
  c1,   -- point 1        
  c2,   -- point 2        
  rel, -- edge property        
  depth, -- depth, starting from 1        
  path  -- path, stored using an array            
) AS (        
        SELECT    -- ROOT node query        
          g.c1,   -- point 1        
          g.c2,   -- point 2        
          g.rel::text,   -- edge property        
          CASE 
            WHEN g.rel = 6 or g.rel = 5 THEN 0                            -- initial depth=1        
            ELSE 1
          END AS depth,      
          ARRAY[g.c1, g.c2] path             -- initial path        
        FROM tbl_er AS g         
        WHERE         
          c1 = %s         -- ROOT node =?      -- (the start of the shortest path)        
      UNION ALL        
        SELECT     -- recursive clause        
          g.c1,    -- point 1        
          g.c2,    -- point 2        
          sg.rel::text || g.rel::text,          -- edge property        
          CASE
            WHEN g.rel = 6 or g.rel = 5 THEN sg.depth
            ELSE sg.depth + 1
          END AS depth,                   -- depth +1         
          sg.path || g.c2 path                 -- Add a new point to the path      
        FROM tbl_er AS g, search_graph AS sg   -- circular INNER JOIN        
        WHERE         
          g.c1 = sg.c2         -- recursive JOIN condition        
          AND (g.c2 <> ALL(sg.path))        -- Prevent loop, determine whether it is a loop and judge if the new point is already in the previous path          
          AND sg.depth <= %s    -- search depth =?        
    
)        
SELECT      
  path as o_path,    
  rel as o_link_rel,    
  depth as o_depth    
FROM search_graph        
  where c2 = %s   -- the end of the shortest path        
  limit 1         -- query a recursive table. You can add LIMIT output or use a cursor        
$_$, i_p1, i_depth, i_p2);    
    
execute sql into o_path,o_link_rel,o_depth;    
return;    
end;    

$$
 language plpgsql strict;
