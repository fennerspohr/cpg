import { db } from '../utils/drizzle'
import { pessoa, relacao } from '../db/schema'
import { sql, count } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const [totalPessoas]  = await db.select({ total: count() }).from(pessoa)
  const [totalRelacoes] = await db.select({ total: count() }).from(relacao)

  const porSexo = await db
    .select({ sexo: pessoa.sexo, total: count() })
    .from(pessoa)
    .groupBy(pessoa.sexo)

  const sobrenomesRes = await db.execute(sql`
    SELECT sobrenome, COUNT(*)::int AS total
    FROM pessoa
    GROUP BY sobrenome
    ORDER BY total DESC
    LIMIT 10
  `)

  const totalSobrenomesRes = await db.execute(sql`
    SELECT COUNT(DISTINCT sobrenome)::int AS total FROM pessoa
  `)

  const semVinculoRes = await db.execute(sql`
    SELECT COUNT(*)::int AS total
    FROM pessoa
    WHERE id NOT IN (
      SELECT DISTINCT p1 FROM relacao
      UNION
      SELECT DISTINCT p2 FROM relacao
    )
  `)

  const maisAntigaRes = await db.execute(sql`
    SELECT nome, sobrenome, datanasc FROM pessoa
    WHERE datanasc IS NOT NULL ORDER BY datanasc ASC LIMIT 1
  `)

  const maisRecenteRes = await db.execute(sql`
    SELECT nome, sobrenome, datanasc FROM pessoa
    WHERE datanasc IS NOT NULL ORDER BY datanasc DESC LIMIT 1
  `)

  const porDecadaRes = await db.execute(sql`
    SELECT (FLOOR(EXTRACT(YEAR FROM datanasc) / 10) * 10)::int AS decada,
           COUNT(*)::int AS total
    FROM pessoa
    WHERE datanasc IS NOT NULL
    GROUP BY decada
    ORDER BY decada
  `)

  const cidadesNascRes = await db.execute(sql`
    SELECT l.descricao, l.estado, COUNT(*)::int AS total
    FROM pessoa p
    JOIN local l ON p.localnasc = l.id
    GROUP BY l.id, l.descricao, l.estado
    ORDER BY total DESC
    LIMIT 8
  `)

  const cidadesObitoRes = await db.execute(sql`
    SELECT l.descricao, l.estado, COUNT(*)::int AS total
    FROM pessoa p
    JOIN local l ON p.localmorte = l.id
    GROUP BY l.id, l.descricao, l.estado
    ORDER BY total DESC
    LIMIT 8
  `)

  const coberturaRes = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE datanasc IS NOT NULL)::int    AS com_nasc,
      COUNT(*) FILTER (WHERE datamorte IS NOT NULL)::int   AS com_morte,
      COUNT(*) FILTER (WHERE databatismo IS NOT NULL)::int AS com_batismo,
      COUNT(*) FILTER (WHERE localnasc IS NOT NULL)::int   AS com_localnasc,
      COUNT(*) FILTER (WHERE localmorte IS NOT NULL)::int  AS com_localmorte,
      COUNT(*)::int AS total
    FROM pessoa
  `)

  const maisConectadosRes = await db.execute(sql`
    SELECT p.nome, p.sobrenome, p.sexo,
      (SELECT COUNT(*) FROM relacao WHERE p1 = p.id OR p2 = p.id)::int AS total
    FROM pessoa p
    ORDER BY total DESC
    LIMIT 5
  `)

  const mediaRelacoesRes = await db.execute(sql`
    SELECT ROUND(AVG(cnt)::numeric, 1) AS media
    FROM (
      SELECT p.id, COUNT(r.id)::int AS cnt
      FROM pessoa p
      LEFT JOIN relacao r ON r.p1 = p.id OR r.p2 = p.id
      GROUP BY p.id
    ) sub
  `)

  return {
    totalPessoas:    totalPessoas.total,
    totalRelacoes:   totalRelacoes.total,
    totalSobrenomes: (totalSobrenomesRes.rows[0] as any)?.total ?? 0,
    porSexo,
    sobrenomes:      sobrenomesRes.rows,
    semVinculo:      (semVinculoRes.rows[0] as any)?.total ?? 0,
    maisAntiga:      maisAntigaRes.rows[0]    ?? null,
    maisRecente:     maisRecenteRes.rows[0]   ?? null,
    porDecada:       porDecadaRes.rows,
    cidadesNasc:     cidadesNascRes.rows,
    cidadesObito:    cidadesObitoRes.rows,
    cobertura:       coberturaRes.rows[0]     ?? null,
    maisConectados:  maisConectadosRes.rows,
    mediaRelacoes:   (mediaRelacoesRes.rows[0] as any)?.media ?? 0,
  }
})
