'use strict'

import { app, BrowserWindow, Tray, Menu, shell } from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, tray

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

if (process.platform === 'darwin') {
  app.dock.hide()
}

app.on('second-instance', (event, argv, cwd) => {
  console.log('Second instance')
  appClose()
})

function destroyTray () {
  if (tray) {
    tray.destroy()
    tray = null
    mainWindow = null
  }
}

function createWindow () {
  // Make app available on vue
  BrowserWindow.prototype.$app = app

  mainWindow = new BrowserWindow({
    height: 550,
    useContentSize: true,
    width: 500,
    frame: false,
    autoHideMenuBar: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', appClose)

  let edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        click: function () {
          self.getWindow().webContents.undo()
        }
      }, {
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y',
        click: function () {
          self.getWindow().webContents.redo()
        }
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        click: function () {
          self.getWindow().webContents.cut()
        }
      }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        click: function () {
          self.getWindow().webContents.copy()
        }
      }, {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        click: function () {
          self.getWindow().webContents.paste()
        }
      }, {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        click: function () {
          self.getWindow().webContents.selectAll()
        }
      }
    ]
  }

  let editMacOS = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  }

  let view = {
    label: 'View',
    submenu: [
      {
        label: 'Developer Tools',
        accelerator: 'Shift+CmdOrCtrl+J',
        click: function () {
          self.getWindow().toggleDevTools()
        }
      }
    ]
  }

  let windowMenu = Menu.setApplicationMenu(
    Menu.buildFromTemplate([process.platform === 'darwin' ? editMacOS : edit, view])
  )

  let trayIcon = path.join(__dirname, '../../src/resources/icons/tray-icon@2x.png')

  if (process.platform === 'darwin') {
    trayIcon = path.join(__dirname, '../../src/resources/icons/tray-icon-macTemplate@2x.png')
  }

  if (process.env.NODE_ENV === 'production') {
    // trayIcon = path.join(__dirname, '../../src/resources/icons/tray-icon@2x.png')
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('X Cloud Desktop')

  const contextMenu = () => Menu.buildFromTemplate([
    {
      label: 'Billing',
      click: function () {
        shell.openExternal('https://cloud.internxt.com/storage')
      }
    },
    {
      label: 'Quit',
      click: appClose
    }
  ])

  tray.setContextMenu(contextMenu())
}

app.on('ready', createWindow)

function appClose () {
  destroyTray()
  if (process.platform !== 'darwin') {
    app.quit()
  }

  app = null
}

app.on('window-all-closed', appClose)

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', function (evt) {
  tray.destroy()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */