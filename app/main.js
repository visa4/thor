const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const fs     = require('fs')
const url    = require('url')
const path   = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let receive, sender, config;

function loadConfig () {
    console.log(path.join(__dirname, '/config/global.js'));
  config = JSON.parse(fs.readFileSync( path.join(__dirname, '/config/global.js'), {'encoding': 'UTF8'}));
}

function createWindow () {

  loadConfig()

  // App
  polymer = new BrowserWindow({
    width: 700,
    height: 500,
    titleBarStyle: 'hidden',
    x: 0,
    y: 0,
    autoHideMenuBar: true
  })

  polymer.maximize();

  // and load the index.html of the app.
  polymer.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  polymer.on('closed', () => {
    polymer = null
  })


  if (config && config.debug == true) {
   // sender.webContents.openDevTools({detached: true});
    polymer.webContents.openDevTools({detached: true});
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (polymer === null) {
    createWindow()
  }
})
