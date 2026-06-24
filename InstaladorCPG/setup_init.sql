-- Cria o usuario da aplicacao, se ainda nao existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cpg') THEN
    CREATE ROLE cpg LOGIN PASSWORD 'cpg';
  END IF;
END
$$;

-- Cria o banco de dados, se ainda nao existir
SELECT 'CREATE DATABASE cpg OWNER cpg'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cpg')
\gexec
