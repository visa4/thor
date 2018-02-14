const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const fs    = require('fs');
const url   = require('url');
const path  = require('path');
const MainMonitor = require('./lib/model/monitor/main/MainMonitor.js');
const mainMonitorWrapper = require('./lib/model/MainMonitorWrapper.js');
const PropertyHydrator = require('./lib/hydrator/PropertyHydrator.js');
const HydratorStrategy = require('./lib/hydrator/strategy/HydratorStrategy.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let config;
let monitorsWrapper = null;

function loadConfig () {
    config = JSON.parse(fs.readFileSync( path.join(__dirname, '/config/global.json'), {'encoding': 'UTF8'}));
}

function createWindowDashboard () {

    loadConfig();
    loadAppConfig();

    // App
    dashboard = new BrowserWindow({
        width: 700,
        height: 500,
        titleBarStyle: 'hidden',
        x: 0,
        y: 0,
        autoHideMenuBar: true
    });

    dashboard.loadURL(url.format({
        pathname: path.join(__dirname, '/dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    dashboard.on('closed', () => {
        dashboard = null
    });


    if (config && config.debug === true) {
        dashboard.webContents.openDevTools({detached: true});
    }
}

/**
 * @param monitorsConfig
 * @returns {MonitorsManager}
 */
function createWindowsPlayer(monitorsConfig) {

    let hydrator = new PropertyHydrator(
        new mainMonitorWrapper(),
        {
            'monitors' :  new HydratorStrategy(new PropertyHydrator(new MainMonitor()))
        }
    );

    let monitorWrapper = hydrator.hydrate(monitorsConfig);

    for (let cont = 0; monitorWrapper.monitors.length > cont; cont++) {

        monitorWrapper.monitors[cont].browserWindows = createWindowPlayer(monitorWrapper.monitors[cont]);
    }
    return monitorWrapper;
}

/**
 * @param mainMonitor
 * @returns {Electron.AllElectron.BrowserWindow}
 */
function createWindowPlayer(mainMonitor) {

    console.log('create monitor:', parseInt(mainMonitor.width), parseInt(mainMonitor.height));
    let browserWindows = new BrowserWindow({
        width: parseInt(mainMonitor.width),
        height: parseInt(mainMonitor.height),
        x: parseInt(mainMonitor.offsetX),
        y: parseInt(mainMonitor.offsetY),
        movable: true,
        resizable: false,
        frame: false,
        enableLargerThanScreen: true,
        hasShadow: false

    });

    browserWindows.on('closed', () => {
        win = null
    });

    browserWindows.webContents.on('did-finish-load', () => {
        browserWindows.send('player-monitor-config', mainMonitor);
    });

    if (config && config.debug === true) {
        browserWindows.webContents.openDevTools({detached: true});
    }

    browserWindows.loadURL(url.format({
        pathname: path.join(__dirname, '/player.html'),
        protocol: 'file:',
        slashes: true
    }));

    return browserWindows;
}


function loadAppConfig () {
    let appConfig = JSON.parse(fs.readFileSync( path.join(__dirname, '/storage/app-config.json'), {'encoding': 'UTF8'}));
    if (appConfig && appConfig.monitorConfig) {
        monitorsWrapper = createWindowsPlayer(appConfig.monitorConfig);
    }
}


function closeWindowsPlayer() {

    for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
        monitorsWrapper.monitors[cont].browserWindows.close();
    }
    monitorsWrapper.clearMainMonitors();
}

/**
 *  This method will be called when Electron has finished initialization and is ready
 *  to create browser windows. Some APIs can only be used after this event occurs.
 */
app.on('ready', createWindowDashboard);

/**
 * Quit when all windows are closed.
 */
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar to stay active until
    // the user quits explicitly with Cmd + Q
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

/**
 * Impostazione di una nuova configurazione
 */
ipcMain.on('change-monitors-configuration', (event, message) => {

    fs.writeFile(
        path.join(__dirname, '/storage/app-config.json'),
        JSON.stringify({'monitorConfig' : message}),
        function(err) {
            if(err) {
                return console.log("ReloadMonitor save error: " + err);
            }

            closeWindowsPlayer();
            monitorsWrapper = createWindowsPlayer(message);
        }
    );
});

/**
 * Modifica della configurazione abilitata
 */
ipcMain.on('update-enable-monitor-configuration', (event, message) => {

    if (message.monitors && Array.isArray(message.monitors) && message.monitors.length > 0) {

        fs.writeFile(
            path.join(__dirname, '/storage/app-config.json'),
            JSON.stringify({'monitorConfig' : message}),
            function(err) {
                if(err) {
                    return console.log("UpdateMonitor save error: " + err);
                }

                for (let cont = 0; message.monitors.length > cont; cont++) {
                    let currentMonitor = monitorsWrapper.getMainMonitor(message.monitors[cont].id);

                    if (!currentMonitor) {

                        let hydrator = new PropertyHydrator(new MainMonitor());
                        let mainMonitor = hydrator.hydrate(message.monitors[cont]);

                        mainMonitor.browserWindows = createWindowPlayer(mainMonitor);
                        monitorsWrapper.pushMainMonitor(mainMonitor);
                        continue;
                    }

                    let changeSize = false;

                    if (currentMonitor.width !== message.monitors[cont].width ||
                        currentMonitor.height !== message.monitors[cont].height
                    ) {
                        changeSize = true;
                    }

                    if (changeSize) {
                        //console.log('Cambia dim:',    currentMonitor.width, currentMonitor.height, message.monitors[cont].width, message.monitors[cont].height);

                        currentMonitor.browserWindows.setSize(
                            parseInt(message.monitors[cont].width),
                            parseInt(message.monitors[cont].height)
                        );
                    }


                    let position = false;

                    if (currentMonitor.offsetX !== message.monitors[cont].offsetX ||
                        currentMonitor.offsetY !== message.monitors[cont].offsetY
                    ) {
                        position = true;
                    }

                    if (position) {
                        //console.log('Cambia pos:',    currentMonitor.offsetX, currentMonitor.offsetX, message.monitors[cont].offsetY, message.monitors[cont].offsetX);

                        currentMonitor.browserWindows.setPosition(
                            parseInt(message.monitors[cont].offsetX),
                            parseInt(message.monitors[cont].offsetY)
                        );
                    }

                }
            }
        );

    }

});