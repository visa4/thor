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
    'Config',
    function (sm) {
        const fs = require('fs');
        return  JSON.parse(fs.readFileSync(__dirname + '/config/application.json'));
    }
).set(
    'Application',
    (function(sm){
        const fs = require('fs');
        return new Application(
            JSON.parse(fs.readFileSync(__dirname + '/config/application.json'))
        );
    })()
);