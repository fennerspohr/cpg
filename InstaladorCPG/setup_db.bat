@echo off
setlocal

REM ===========================================================
REM  Configuracao automatica do banco de dados - MeuApp
REM  Este script roda silenciosamente durante a instalacao
REM ===========================================================

REM Detecta automaticamente a pasta de versao do Postgres instalado
REM (evita quebrar de novo se a versao baixada mudar no futuro)
set PGVER=
for /f "delims=" %%v in ('dir /b /ad "C:\Program Files\PostgreSQL" 2^>nul') do set PGVER=%%v
if "%PGVER%"=="" goto :sem_postgres
set PGBIN="C:\Program Files\PostgreSQL\%PGVER%\bin"
echo Postgres detectado: versao %PGVER%

set PGSUPERUSER=postgres
set PGSUPERPASS=%1
set DBNAME=cpg
set DBUSER=cpg
set DBUSERPASS=%2
set PGPASSWORD=%PGSUPERPASS%

REM Espera ativamente o Postgres aceitar conexoes (em vez de tempo fixo)
echo Aguardando o PostgreSQL ficar disponivel...
set TENTATIVAS=0
:esperar
%PGBIN%\pg_isready -h localhost -U %PGSUPERUSER% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :pronto
set /a TENTATIVAS+=1
if %TENTATIVAS% GEQ 40 goto :timeout_postgres
timeout /t 1 /nobreak >nul
goto :esperar

:timeout_postgres
echo ERRO: PostgreSQL nao respondeu apos 40 segundos.
exit /b 1

:pronto
echo PostgreSQL disponivel.

REM Cria o usuario e o banco de dados (via arquivo .sql, evita problemas de aspas no cmd)
%PGBIN%\psql -U %PGSUPERUSER% -h localhost -v ON_ERROR_STOP=1 -f "%~dp0setup_init.sql"
if %ERRORLEVEL% NEQ 0 goto :erro

REM Roda o script de criacao de tabelas, functions e trigger
%PGBIN%\psql -U %PGSUPERUSER% -h localhost -d %DBNAME% -v ON_ERROR_STOP=1 -f "%~dp0create_tables.sql"
if %ERRORLEVEL% NEQ 0 goto :erro

echo Banco de dados configurado com sucesso.
exit /b 0

:sem_postgres
echo ERRO: Pasta do PostgreSQL nao encontrada em "C:\Program Files\PostgreSQL".
exit /b 1

:erro
echo ERRO: Falha ao configurar o banco de dados.
exit /b 1
