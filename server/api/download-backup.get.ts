import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Localiza o pg_dump.exe sem depender da variavel PATH do sistema,
// que pode nao estar atualizada no processo do app empacotado
// (o Postgres adiciona ao PATH na instalacao, mas isso so vale
// para processos abertos DEPOIS dessa atualizacao/reinicio).
function findPgDump(): string {
  if (process.platform === 'win32') {
    const base = 'C:\\Program Files\\PostgreSQL';
    if (existsSync(base)) {
      const versoes = readdirSync(base, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
        .reverse(); // pega a versao mais recente primeiro, se houver mais de uma

      for (const v of versoes) {
        const caminho = join(base, v, 'bin', 'pg_dump.exe');
        if (existsSync(caminho)) return caminho;
      }
    }
    // Fallback: tenta o PATH mesmo assim, caso a instalacao seja atipica
    return 'pg_dump.exe';
  }
  // Linux/Mac (ambiente de desenvolvimento): assume que esta no PATH
  return 'pg_dump';
}

export default defineEventHandler(async (event) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw createError({ statusCode: 500, message: 'DATABASE_URL not set' });
  }

  const url = new URL(dbUrl);
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.dump`;
  const pgDumpPath = findPgDump();

  setHeader(event, 'Content-Type', 'application/octet-stream');
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);

  const pg = spawn(pgDumpPath, [
    '--host',     url.hostname,
    '--port',     url.port || '5432',
    '--username', url.username,
    '--dbname',   url.pathname.replace('/', ''),
    '-F',
    'c',
    '--no-owner',
    '--no-acl',
    '--data-only'
  ], {
    env: { ...process.env, PGPASSWORD: url.password },
  });

 // Armazena mensagens de erro caso o processo falhe
  let stderrOutput = '';
  pg.stderr.on('data', (data) => {
    stderrOutput += data.toString();
    console.error('[backup] pg_dump stderr:', data.toString());
  });

  pg.on('error', (err) => {
    console.error('[backup] Falha ao iniciar pg_dump:', err);
  });

  // Se o pg_dump fechar com erro após o stream ter começado,
  // destrói a resposta para sinalizar o erro ao cliente/navegador
  pg.on('close', (code) => {
    if (code !== 0) {
      console.error(`[backup] pg_dump falhou com código ${code}. Erro: ${stderrOutput}`);
      event.node.res.destroy(); // Corta a conexão HTTP para não enviar um arquivo quebrado
    }
  });

  // Stream pg_dump output directly to the HTTP response
  return sendStream(event, pg.stdout);
});