; =====================================================================
;  Instalador unificado - MeuApp
;  Instala PostgreSQL (se necessario), configura o banco e instala o app
; =====================================================================

#define MyAppName "CPG"
#define MyAppVersion "1.0"
#define MyAppExeName "CPG.exe"

; Credenciais do banco - definidas uma unica vez e reaproveitadas
; no setup_db.bat e no arquivo .env, para nao ficarem duplicadas/divergentes
#define PgMajorVersion "17"
#define PgInstallerFile "postgresql-17.10-2-windows-x64.exe"
#define PgServiceName "postgresql-x64-17"
#define PgSuperPass "PgSuperSenha2026!"
#define DbHost "localhost"
#define DbPort "5432"
#define DbName "cpg"
#define DbUser "cpg"
#define DbUserPass "cpg"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename=CPG_Instalador
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern
DisableDirPage=no
UsePreviousAppDir=no

[Files]
; Copia TODA a pasta de saida do build do Electron (exe + resources + dlls + locales etc)
Source: "dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#PgInstallerFile}"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "setup_db.bat"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "setup_init.sql"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "create_tables.sql"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
; Atalho no Menu Iniciar
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
; Atalho na Área de Trabalho (autodesktop = pasta Desktop do usuário atual)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Tasks]
; Deixa o atalho da área de trabalho marcado por padrão, mas o usuário pode desmarcar na tela de instalação
Name: "desktopicon"; Description: "Criar um atalho na Área de Trabalho"; GroupDescription: "Atalhos adicionais:"; Flags: checkedonce

[Run]
; Passo 1: instala o PostgreSQL silenciosamente (so roda se ainda nao existir)
Filename: "{tmp}\{#PgInstallerFile}"; \
    Parameters: "--mode unattended --unattendedmodeui minimal --superpassword ""{#PgSuperPass}"" --servicename {#PgServiceName} --serverport {#DbPort}"; \
    StatusMsg: "Instalando componentes necessarios (isso pode levar alguns minutos)..."; \
    Check: not IsPostgresInstalled; Flags: waituntilterminated

; Passo 1.5: garante que o servico do Postgres esta iniciado (caso nao tenha iniciado automaticamente)
Filename: "{sys}\net.exe"; Parameters: "start {#PgServiceName}"; \
    StatusMsg: "Iniciando o PostgreSQL..."; Flags: runhidden waituntilterminated

; Passo 2: configura banco, usuario e tabelas
Filename: "{tmp}\setup_db.bat"; \
    Parameters: "{#PgSuperPass} {#DbUserPass}"; \
    StatusMsg: "Preparando banco de dados..."; \
    Flags: waituntilterminated runhidden

; Passo 3: abre o app ao final (opcional)
Filename: "{app}\{#MyAppExeName}"; Description: "Abrir {#MyAppName}"; Flags: nowait postinstall skipifsilent

[Code]
function IsPostgresInstalled: Boolean;
begin
  Result := DirExists('C:\Program Files\PostgreSQL\{#PgMajorVersion}');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  EnvContent: AnsiString;
  EnvPath: String;
begin
  if CurStep = ssPostInstall then
  begin
    // Monta o conteudo do .env com a string de conexao do banco
    EnvContent :=
      'DATABASE_URL=postgresql://{#DbUser}:{#DbUserPass}@{#DbHost}:{#DbPort}/{#DbName}' + #13#10;

    EnvPath := ExpandConstant('{app}') + '\.env';

    if not SaveStringToFile(EnvPath, EnvContent, False) then
      MsgBox('Não foi possível criar o arquivo .env em ' + EnvPath, mbError, MB_OK);
  end;
end;
