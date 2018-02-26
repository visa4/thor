/**
 *
 */
class PluginConfig {

    /**
     *
     * @param serviceManager
     */
    constructor(serviceManager) {

        if (serviceManager === null ||
            typeof serviceManager !== 'object' ||
            serviceManager.constructor.name !== 'ServiceManager') {

            throw 'Invalid service manager';
        }

        this.serviceManager = serviceManager ? serviceManager : null;
    }

    /**
     *
     */
    init() {

    }
}

module.exports = PluginConfig;