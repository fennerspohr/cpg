-- CREATE USER cpg WITH PASSWORD 'cpg';
-- GRANT ALL PRIVILEGES ON DATABASE cpg TO cpg;

CREATE TABLE Local(
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100)
);

CREATE TABLE Pessoa(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    sexo CHAR(1),
    dataNasc DATE,
    localNasc INT REFERENCES Local(id),
    dataBatismo DATE,
    localBatismo INT REFERENCES Local(id),
    dataMorte DATE,
    localMorte INT REFERENCES Local(id),
    obs text,
    creation_time TIMESTAMP
);

CREATE TABLE Tipo_Relacao(
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100)
);

CREATE TABLE Relacao(
    p1 INT REFERENCES Pessoa(id),
    p2 INT REFERENCES Pessoa(id),
    prop INT REFERENCES Tipo_Relacao(id),
    metadata JSONB,
    creation_time TIMESTAMP,
    constraint p_diff check (p1<>p2),
    constraint p_unique unique (p1, p2)
);

CREATE INDEX idx_relacao_p1 ON Relacao(p1);
CREATE INDEX idx_relacao_p2 ON Relacao(p2);