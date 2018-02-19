

try {
    ServiceManager = require('/../../ServiceManager');
}
catch(err) {
    ServiceManager = require(__dirname + '/lib/service-manager/ServiceManager');
}

class LocalStoragePluginManager extends ServiceManager {

    /**
     * @returns HydratorPluginManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new LocalStoragePluginManager();
        }
        return this.instance;
    }
}
