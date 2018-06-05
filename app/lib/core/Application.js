try {
    EvtManager = require('./../EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

/**
 *
 */
class Application {

    static BOOTSTRAP_MODULE() { return 'bootstrap-module' };

    static LOAD_MODULE() { return 'laod-module' };

    /**
     * @param {Object} config
     */
    constructor(config = {}) {

        /**
         *    * @type {EvtManager}
         */
        this.eventManager = new EvtManager();

        /**
         *
         * @type {Array}
         */
        this.modules = [];

        /**
         * @type {boolean}
         */
        this.bootstrapModule = false;

        if (config.modules) {
            for (let cont = 0; config.modules.length > cont; cont++) {
                this.modules.push(this.laodModule(config.modules[cont]))
            }
            this.eventManager.fire(Application.BOOTSTRAP_MODULE, this);
            this.bootstrapModule = true;
            delete config.modules;
        }


        /**
         * @type {Object}
         */
        this.config = config;


    }

    /**
     * @return {PropertyHydrator}
     */
    getHydrator() {
        if (!this.hydrator) {
            this.hydrator = new PropertyHydrator(
                new Module()
            )
        }
        return this.hydrator
    }

    /**
     *
     * @param module
     * @return {Object}
     */
    laodModule(module) {

        this._checkModule(module);

        let moduleObj = this.getHydrator().hydrate(module);

        /**
         * Autoload file plugin
         */
        for (let cont = 0; moduleObj.autoloads.length > cont; cont++) {
            // TODO CONTROLLARE SE ESISTE IL FILE
            let importClass = require(`${__dirname}/plugin/${moduleObj.name}/${moduleObj.autoloads[cont]}`);
            global[importClass.name] = importClass;
        }

        if (moduleObj.configFile) {

            let config = require(`${__dirname}/plugin/${moduleObj.name}/${moduleObj.configFile}`);

            let pluginConfig = new config(serviceManager);
            global[pluginConfig.constructor.name] = config;
            pluginConfig.init();
        }

        this.eventManager.fire(Application.LOAD_MODULE, moduleObj);
        return moduleObj;
    }

    getConfig(value) {

    }

    /**
     * @param module
     * @private
     */
    _checkModule(module) {
        if (module === null || typeof module !== 'object') {
            throw 'Wrong exception';
        }
    }
}

module.exports = Application;