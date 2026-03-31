-- CREATE USER cpg WITH PASSWORD 'cpg';
-- GRANT ALL PRIVILEGES ON DATABASE cpg TO cpg;

-- CREATE TABLE Pessoa(
--     id SERIAL PRIMARY KEY,
--     nome VARCHAR(100),
--     sexo CHAR(1),
--     dataNasc DATE,
--     localNasc VARCHAR(100),
--     dataBatismo DATE,
--     localBatismo VARCHAR(100),
--     obs text,
--     creation_time TIMESTAMP
-- );

-- CREATE TABLE Desc_Relacao(
--     id SERIAL PRIMARY KEY,
--     info VARCHAR(100)
-- );

-- CREATE TABLE Relacao_1P2(
--     p1 INT REFERENCES Pessoa(id),
--     p2 INT REFERENCES Pessoa(id),
--     prop INT REFERENCES Desc_Relacao(id), --verificar necessidade de ser um array,
--     creation_time TIMESTAMP,
--     constraint p_diff check (p1<>p2)
-- );

-- CREATE INDEX idx_relacao_p1 ON Relacao_1P2(p1);
-- CREATE INDEX idx_relacao_p2 ON Relacao_1P2(p2);