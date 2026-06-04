import { spawn } from 'child_process';

export default defineEventHandler(async (event) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw createError({ statusCode: 500, message: 'DATABASE_URL not set' });
  }

  const url = new URL(dbUrl);
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.sql`;

  setHeader(event, 'Content-Type', 'application/octet-stream');
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);

  const pg = spawn('pg_dump', [
    '--host',     url.hostname,
    '--port',     url.port || '5432',
    '--username', url.username,
    '--dbname',   url.pathname.replace('/', ''),
    '--format',   'plain',
    '--no-owner',
    '--no-acl',
  ], {
    env: { ...process.env, PGPASSWORD: url.password },
  });

  // Stream pg_dump output directly to the HTTP response
  return sendStream(event, pg.stdout);
});