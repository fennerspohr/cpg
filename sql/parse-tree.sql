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
$$ language plpgsql;