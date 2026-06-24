const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const { pathToFileURL } = require('url')

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

  console.log('Looking for .env at:', envPath)
  console.log('File exists:', fs.existsSync(envPath))

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
}

loadEnv()

let mainWindow = null
const PORT = 3000

const preloadPath = path.join(__dirname, 'preload.cjs')

const windowConfigs = {
  detalhes: (p) => ({
    width: 740, height: 700,
    path: `/janela/detalhes?id=${p.id}`,
  }),
  arvore: (p) => ({
    width: 940, height: 660,
    path: `/janela/arvore?id=${p.id}&nome=${encodeURIComponent(p.nome || '')}`,
  }),
  local: () => ({
    width: 560, height: 600,
    path: '/janela/local',
  }),
  editar: (p) => ({
    width: 900, height: 780,
    path: `/janela/editar/${p.id}`,
  }),
}

function createChildWindow(type, params) {
  const cfgFn = windowConfigs[type]
  if (!cfgFn) return
  const cfg = cfgFn(params || {})

  const win = new BrowserWindow({
    width: cfg.width,
    height: cfg.height,
    frame: cfg.frame === true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    autoHideMenuBar: true,
  })

  win.loadURL(`http://localhost:${PORT}${cfg.path}`)
}

ipcMain.on('open-window', (event, type, params) => {
  createChildWindow(type, params)
})

ipcMain.on('minimize-window', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.on('notify-refresh', () => {
  if (mainWindow) mainWindow.webContents.send('do-refresh')
})

ipcMain.on('navigate-main', (event, path) => {
  if (mainWindow) mainWindow.webContents.send('do-navigate', path)
})

async function startNuxtServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', '.output', 'server', 'index.mjs')
    : path.join(__dirname, '..', '.output', 'server', 'index.mjs')

  process.env.PORT = String(PORT)
  process.env.NODE_ENV = 'production'

  await import(pathToFileURL(serverPath).href)

  await waitForServer()
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const poll = setInterval(() => {
      if (Date.now() - startTime > 20000) {
        clearInterval(poll)
        reject(new Error('Nuxt server timed out after 20s'))
        return
      }

      http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode < 500) {
          clearInterval(poll)
          resolve()
        }
      }).on('error', () => {})
    }, 300)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    title: 'CPG',
    autoHideMenuBar: true,
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)

  mainWindow.on('focus', () => {
    BrowserWindow.getAllWindows()
      .filter(w => w !== mainWindow && !w.isMinimized())
      .forEach(w => w.moveTop())
  })

  mainWindow.on('close', (event) => {
    const filhas = BrowserWindow.getAllWindows().filter(w => w !== mainWindow)
    if (filhas.length === 0) return

    event.preventDefault()
    const escolha = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Fechar tudo', 'Cancelar'],
      defaultId: 0,
      cancelId: 1,
      title: 'Fechar CPG',
      message: `Há ${filhas.length} janela(s) aberta(s).`,
      detail: 'Deseja fechar todas as janelas e sair?',
    })
    if (escolha === 0) {
      filhas.forEach(w => w.destroy())
      mainWindow.destroy()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    await startNuxtServer()
    createWindow()
  } catch (err) {
    dialog.showErrorBox(
      'Falha ao iniciar o servidor',
      `Não foi possível iniciar o servidor Nuxt:\n\n${err.message}\n\nVerifique se o arquivo .env existe com a URL do banco de dados.`
    )
    app.quit()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
