const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const fs    = require('fs');
const url   = require('url');
const path  = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let receive, sender, config;
let monitors = null;

class MonitorConfig {
    constructor(config, browserWindow) {
        this.config = config;
        this.browserWindows = browserWindow;
    }
}

class MonitorsManager {
    constructor() {
        this.monitors = [];
    }

    push(monitorConfig) {
        this.monitors.push(monitorConfig);
    }

    clear() {
        this.monitors = [];
    }

    getList() {
        return this.monitors;
    }
}

function loadConfig () {
  config = JSON.parse(fs.readFileSync( path.join(__dirname, '/config/global.json'), {'encoding': 'UTF8'}));
}

function createWindowDashboard () {

  loadConfig()

  // App
  dashboard = new BrowserWindow({
    width: 700,
    height: 500,
    titleBarStyle: 'hidden',
    x: 0,
    y: 0,
    autoHideMenuBar: true
  });

  //dashboard.maximize();


  dashboard.loadURL(url.format({
    pathname: path.join(__dirname, '/dashboard.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  dashboard.on('closed', () => {
    dashboard = null
  })


  if (config && config.debug === true) {
   // sender.webContents.openDevTools({detached: true});
    dashboard.webContents.openDevTools({detached: true});
  }
}

/**
 * @param monitorsConfig
 * @returns {MonitorsManager}
 */
function createWindowPlayer(monitorsConfig) {

  let monitors = new MonitorsManager();

  if (monitorsConfig.monitors && Array.isArray(monitorsConfig.monitors) && monitorsConfig.monitors.length > 0) {

    for (let cont = 0; monitorsConfig.monitors.length > cont; cont++) {

        let win = new BrowserWindow({
            width: parseInt(monitorsConfig.monitors[cont].width),
            height: parseInt(monitorsConfig.monitors[cont].height),
            x: parseInt(monitorsConfig.monitors[cont].offsetX),
            y:  parseInt(monitorsConfig.monitors[cont].offsetY),
            movable : false,
            resizable: false,
            frame: false,
            enableLargerThanScreen: true,
            hasShadow: false

        });
        win.on('closed', () => {
            win = null
        });

        win.loadURL(url.format({
            pathname: path.join(__dirname, '/player.html'),
            protocol: 'file:',
            slashes: true
        }))

        monitors.push(new MonitorConfig(
            monitorsConfig.monitors[cont],
            win
        ));
    }
    return monitors;
  }
}

function closeWindowsPlayer() {

    if (!monitors) {
        return;
    }

    let list = monitors.getList();

    if (list) {
        for (let cont = 0; list.length > cont; cont++) {
            list[cont].browserWindows.close();
        }
        monitors.clear();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindowDashboard)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (dashboard === null) {
    createWindowDashboard()
  }
})


ipcMain.on('change-monitors-configuration', (event, message) => {

  if (JSON.stringify(monitors) === JSON.stringify(message)) {
    return;
  }

  monitorsConfig = message;

  fs.writeFile(
    path.join(__dirname, '/storage/app-config.json'),
    JSON.stringify({'monitor-config' : message}),
    function(err) {
      if(err) {
        return console.log("ReloadMonitor save error: " + err);
      }

      closeWindowsPlayer();
      monitors = createWindowPlayer(message);
    }
  );
});