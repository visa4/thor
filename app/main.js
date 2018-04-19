const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const fs    = require('fs');
const url   = require('url');
const path  = require('path');
const MainMonitor = require('./lib/model/monitor/Monitor.js');
const mainMonitorWrapper = require('./lib/model/monitor/VirtualMonitor.js');
const PropertyHydrator = require('./lib/hydrator/PropertyHydrator.js');
const HydratorStrategy = require('./lib/hydrator/strategy/HydratorStrategy.js');
const HydratorManager = require('./lib/hydrator/pluginManager/HydratorPluginManager');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let packageJson;
let monitorsWrapper = null;
let hydratorManager = new HydratorManager();


let monitorHydrator = new PropertyHydrator(
    new MainMonitor(),
    {
        'monitors' :  new HydratorStrategy(new PropertyHydrator(new MainMonitor()))
    }
);

let mainMonitorHydrator = new PropertyHydrator(
    new mainMonitorWrapper(),
    {
        'monitors' :  new HydratorStrategy(monitorHydrator)
    }
);

hydratorManager.set('mainMonitorHydrator', mainMonitorHydrator)
    .set('monitorHydrator', monitorHydrator);

function loadConfig () {
    packageJson = JSON.parse(fs.readFileSync( path.join(__dirname, '/package.json'), {'encoding': 'UTF8'}));
}


function createWindowDashboard () {

    loadConfig();
    loadAppConfig();

    // App
    dashboard = new BrowserWindow({
        width: 1000,
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


    if (packageJson && packageJson.appConfig.debug === true) {
        dashboard.webContents.openDevTools({detached: true});
    }
}

/**
 * @param monitorsConfig
 * @returns {MonitorsManager}
 */
function createWindowsPlayer(monitorsConfig) {

    let monitorWrapper = hydratorManager.get('mainMonitorHydrator').hydrate(monitorsConfig);

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

    if (packageJson && packageJson.appConfig.debug === true) {
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
    monitorsWrapper.clearMonitors();
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

                    let currentMonitor = monitorsWrapper.getMonitor(message.monitors[cont].id);

                    if (!currentMonitor) {

                        let mainMonitor = hydratorManager.get('moonitorHydrator').hydrate(message.monitors[cont]);

                        mainMonitor.browserWindows = createWindowPlayer(mainMonitor);
                        monitorsWrapper.pushMonitor(mainMonitor);
                        continue;
                    }

                    let changeSize = false;

                    if (currentMonitor.width !== message.monitors[cont].width ||
                        currentMonitor.height !== message.monitors[cont].height
                    ) {
                        changeSize = true;
                    }

                    if (changeSize) {

                        currentMonitor.browserWindows.setSize(
                            parseInt(message.monitors[cont].width),
                            parseInt(message.monitors[cont].height)
                        );

                        currentMonitor.height = message.monitors[cont].height;
                        currentMonitor.width = message.monitors[cont].width;

                        //currentMonitor.browserWindows.send('player-monitor-update-size', message.monitors[cont]);
                    }

                    let position = false;

                    if (currentMonitor.offsetX !== message.monitors[cont].offsetX ||
                        currentMonitor.offsetY !== message.monitors[cont].offsetY
                    ) {
                        position = true;
                    }

                    if (position) {
                        currentMonitor.browserWindows.setPosition(
                            parseInt(message.monitors[cont].offsetX),
                            parseInt(message.monitors[cont].offsetY)
                        );

                        currentMonitor.offsetY = message.monitors[cont].offsetY
                        currentMonitor.offsetX = message.monitors[cont].offsetX;
                    }
                    currentMonitor.browserWindows.send('player-monitor-update', message.monitors[cont]);
                }

                /**
                 * Save runtime config
                 */
                let hydrator = hydratorManager.get('mainMonitorHydrator');
                hydrator.referenceObject = monitorsWrapper;
                hydrator.hydrate(message);
            }
        );

    }

});


ipcMain.on('start-timeslot', (event, message) => {

    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            let monitor = monitorsWrapper.getMainMonitor(message.timeslot.virtualMonitorReference.monitorId);
            if (monitor) {
                monitor.browserWindows.send('start-timeslot', message);
            } else {
                // TODO write lo log
                console.error('Error not found');
            }
            break;
        default:
            // TODO broadcast on other application on comunication each other
    }


});