const { app, BrowserWindow, dialog } = require('electron')
const { pathToFileURL } = require('url')
const path = require('path')
const http = require('http')
const fs = require('fs')

app.commandLine.appendSwitch('no-sandbox')

// Load .env from the same directory as the AppImage
function loadEnv() {
  let envPath

  if (app.isPackaged) {
    // Windows: use the exe directory directly; Linux AppImage: use APPIMAGE var
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

loadEnv() // ← call before anything else



let mainWindow = null
let nuxtListener = null
const PORT = 3000

// Run the Nuxt server in-process using dynamic import
async function startNuxtServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', '.output', 'server', 'index.mjs')
    : path.join(__dirname, '..', '.output', 'server', 'index.mjs')

  // Set env vars before importing
  process.env.PORT = String(PORT)
  process.env.NODE_ENV = 'production'

  // Dynamically import the Nuxt server (it starts listening on import)
await import(pathToFileURL(serverPath).href)

  // Wait until it's actually responding
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
      }).on('error', () => {
        // Still starting
      })
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
    },
    title: 'CPG',
    autoHideMenuBar: true,
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)

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
