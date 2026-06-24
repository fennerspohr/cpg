const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const { pathToFileURL } = require('url')

// --- LOG EM ARQUIVO para diagnostico (apague depois de resolver) ---
const logPath = path.join(app.getPath('userData'), 'debug.log')
const origLog = console.log
const origError = console.error
const origWarn = console.warn
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  origLog(line)
  try { fs.appendFileSync(logPath, line) } catch (e) {}
}
log(`=== Iniciando app. Log em: ${logPath} ===`)

// Captura tambem console.log/error/warn de QUALQUER lugar (incluindo o Nitro,
// que roda no mesmo processo via import() e normalmente nao mostra console)
console.log = (...args) => { origLog(...args); log(`[console.log] ${args.map(String).join(' ')}`) }
console.error = (...args) => { origError(...args); log(`[console.error] ${args.map(String).join(' ')}`) }
console.warn = (...args) => { origWarn(...args); log(`[console.warn] ${args.map(String).join(' ')}`) }

app.commandLine.appendSwitch('no-sandbox')

function loadEnv() {
  let envPath
  if (app.isPackaged) {
    const appDir = process.env.APPIMAGE
      ? path.dirname(process.env.APPIMAGE)
      : path.dirname(app.getPath('exe'))
    envPath = path.join(appDir, '.env')
  } else {
    envPath = path.join(__dirname, '..', '.env')
  }
  log(`Procurando .env em: ${envPath}`)
  log(`Arquivo existe: ${fs.existsSync(envPath)}`)
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
  log(`DATABASE_URL carregada: ${process.env.DATABASE_URL ? 'sim (valor oculto)' : 'NAO ENCONTRADA'}`)
}
loadEnv()

// Captura erros nao tratados que o import dinamico do Nitro possa disparar
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.stack || err.message}`)
})
process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason && reason.stack ? reason.stack : reason}`)
})

let mainWindow = null
const PORT = 3000

async function startNuxtServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', '.output', 'server', 'index.mjs')
    : path.join(__dirname, '..', '.output', 'server', 'index.mjs')

  log(`Caminho do servidor: ${serverPath}`)
  log(`Arquivo do servidor existe: ${fs.existsSync(serverPath)}`)

  process.env.PORT = String(PORT)
  process.env.NODE_ENV = 'production'

  log('Iniciando import dinamico do servidor...')
  try {
    await import(pathToFileURL(serverPath).href)
    log('Import do servidor concluido sem erro sincrono.')
  } catch (err) {
    log(`ERRO NO IMPORT DO SERVIDOR: ${err.stack || err.message}`)
    throw err
  }

  await waitForServer()
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const poll = setInterval(() => {
      if (Date.now() - startTime > 20000) {
        clearInterval(poll)
        log('TIMEOUT: servidor nao respondeu em 20s')
        reject(new Error('Nuxt server timed out after 20s'))
        return
      }
      http.get(`http://localhost:${PORT}`, (res) => {
        let body = ''
        res.on('data', (chunk) => { body += chunk })
        res.on('end', () => {
          log(`Resposta HTTP: status ${res.statusCode} | corpo: ${body.slice(0, 2000)}`)
          if (res.statusCode < 500) {
            clearInterval(poll)
            resolve()
          }
        })
      }).on('error', (err) => {
        log(`Polling ainda sem resposta: ${err.code || err.message}`)
      })
    }, 300)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    title: 'CPG',
    autoHideMenuBar: true,
  })
  mainWindow.loadURL(`http://localhost:${PORT}`)
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  try {
    await startNuxtServer()
    createWindow()
  } catch (err) {
    log(`FALHA FINAL: ${err.stack || err.message}`)
    dialog.showErrorBox(
      'Falha ao iniciar o servidor',
      `Não foi possível iniciar o servidor Nuxt:\n\n${err.message}\n\nLog completo em:\n${logPath}`
    )
    app.quit()
  }
})

app.on('window-all-closed', () => { app.quit() })
app.on('activate', () => { if (mainWindow === null) createWindow() })