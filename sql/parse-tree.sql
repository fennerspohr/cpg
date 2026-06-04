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
