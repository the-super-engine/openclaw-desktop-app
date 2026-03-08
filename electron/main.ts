import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { spawn, exec } from 'child_process'
import { platform } from 'os'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null

const isDev = !!process.env.VITE_DEV_SERVER_URL

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: platform() === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    backgroundColor: '#0f172a',
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform() !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers for OpenClaw installation and configuration
ipcMain.handle('check-node', async () => {
  return new Promise((resolve) => {
    exec('node --version', (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null })
      } else {
        resolve({ installed: true, version: stdout.trim() })
      }
    })
  })
})

ipcMain.handle('check-openclaw', async () => {
  return new Promise((resolve) => {
    exec('openclaw --version', (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null })
      } else {
        resolve({ installed: true, version: stdout.trim() })
      }
    })
  })
})

ipcMain.handle('install-openclaw', async () => {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['install', '-g', 'openclaw@latest'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    })

    let output = ''
    proc.stdout?.on('data', (data) => {
      output += data.toString()
    })
    proc.stderr?.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output })
      } else {
        reject({ success: false, output, code })
      }
    })

    proc.on('error', (err) => {
      reject({ success: false, output: err.message })
    })
  })
})

ipcMain.handle('run-openclaw-onboard', async () => {
  return new Promise((resolve, reject) => {
    const proc = spawn('openclaw', ['onboard', '--install-daemon'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    })

    let output = ''
    proc.stdout?.on('data', (data) => {
      output += data.toString()
    })
    proc.stderr?.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      resolve({ success: code === 0, output })
    })

    proc.on('error', (err) => {
      reject({ success: false, output: err.message })
    })
  })
})

ipcMain.handle('get-config-path', async () => {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  const configPath = path.join(home, '.openclaw', 'openclaw.json')
  return { path: configPath, exists: fs.existsSync(configPath) }
})

ipcMain.handle('read-config', async () => {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  const configPath = path.join(home, '.openclaw', 'openclaw.json')
  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    return { success: true, config: JSON.parse(content) }
  } catch {
    return { success: false, config: null }
  }
})

ipcMain.handle('write-config', async (_event, config: object) => {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  const configDir = path.join(home, '.openclaw')
  const configPath = path.join(configDir, 'openclaw.json')
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('open-external', async (_event, url: string) => {
  await shell.openExternal(url)
})

ipcMain.handle('get-platform', () => platform())
