CREATE USER cpg WITH PASSWORD 'cpg';
GRANT ALL PRIVILEGES ON DATABASE cpg TO cpg;

CREATE TABLE Pessoa(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    dataNasc DATE,
    localNasc VARCHAR(100),
    dataBatismo DATE,
    localBatismo DATE,
-- Adicionar data e local de casamento em uma tabela de relacionamento entre duas pessoas?
    obs VARCHAR(255)
);