/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
const fs = require('fs');
/**
 * inject default services
 */
Application.injectServices(serviceManager);

/**
 * @type {Object}
 */
serviceManager.set(
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
            JSON.parse(fs.readFileSync(__dirname + '/config/application.json')),
            'player'
        );
    })()
);