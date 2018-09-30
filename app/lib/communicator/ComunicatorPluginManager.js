

try {
    ServiceManager = require('/../service-manager/ServiceManager');
}
catch(err) {
    ServiceManager = require(__dirname + '/lib/service-manager/ServiceManager');
}

class CommunicatorPluginManager extends ServiceManager {

    /**
     * @returns CommunicatorPluginManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new CommunicatorPluginManager();
        }
        return this.instance;
    }
}
