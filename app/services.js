/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
/**
 * Global hydrator plugin manager
 *
 * @type {HydratorPluginManager}
 */
const hydratorPluginManager = new HydratorPluginManager();

/**
 * @type {StoragePluginManager}
 */
const storagePluginManager = new StoragePluginManager();

/**
 * @type {Object}
 */

serviceManager.set(
    hydratorPluginManager.constructor.name,
    hydratorPluginManager
).set(
    storagePluginManager.constructor.name,
    storagePluginManager
).set(
    'PaperToastNotification',
    new PaperToastNotification('notification')
).set(
    'Config',
    function (sm) {
        const fs = require('fs');
        return  JSON.parse(fs.readFileSync(__dirname + '/config/application.json'));
    }
).set(
    'Timer',
    function (sm) {
        const Timer = require('../node_modules/easytimer.js/dist/easytimer.min.js');

        let timer =  new Timer();
        timer.start({precision: 'seconds'});
        return timer;

    }
);

/*
window.onerror = function(message, url, lineNumber) {
    //save error and send to server for example.
    console.log(message, url, lineNumber);
    return true;
};
*/