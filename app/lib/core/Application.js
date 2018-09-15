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
    constructor(config = {}, context = 'player') {

        /**
         * @type {string}
         */
        this.context = context;

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
            delete config.modules;
        }


        /**
         * @type {Object}
         */
        this.config = config;

        /**
         *
         */
        this.basePath = null;
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
         * autoload ES6 class
         */
        for (let cont = 0; moduleObj.autoloads.length > cont; cont++) {
            // TODO CONTROLLARE SE ESISTE IL FILE
            let importClass = require(`${__dirname}/plugin/${moduleObj.name}/${moduleObj.autoloads[cont]}`);
            global[importClass.name] = importClass;
        }

        /**
         * autoload web components
         */

        for (let cont = 0; moduleObj.autoloadWs.length > cont; cont++) {
            Polymer.importHref(
                `${__dirname}/plugin/${moduleObj.name}/${moduleObj.autoloadWs[cont]}`
            );
        }


        if (moduleObj.configFile) {

            let config = require(`${__dirname}/plugin/${moduleObj.name}/${moduleObj.configFile}`);

            let pluginConfig = new config(serviceManager);
            global[pluginConfig.constructor.name] = config;
            pluginConfig.init();
        }

        for (let cont = 0; moduleObj.widgets.length > cont; cont++) {
            Polymer.importHref(
                `${__dirname}/plugin/${moduleObj.name}/${moduleObj.widgets[cont].src}`
            );
        }

        this.eventManager.fire(Application.LOAD_MODULE, moduleObj);
        return moduleObj;
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

    /**
     * @param basePath
     * @returns {Application}
     */
    setBasePath(basePath) {
        this.basePath = basePath;
        return this;
    }

    /**
     * @returns {string}
     */
    getBasePath() {
        return this.basePath;
    }

    /**
     * @return {Array}
     */
    getWidgets() {
        let widgets = [];
        for (let cont = 0; this.modules.length > cont; cont++) {
            widgets = widgets.concat(this.modules[cont].widgets);
        }
        return widgets;
    }

    /**
     * @param serviceManager
     */
    static injectServices(serviceManager) {

        let hydratorPluginManager = new HydratorPluginManager();
        let storagePluginManager = new StoragePluginManager();

        serviceManager.set(
            hydratorPluginManager.constructor.name,
            hydratorPluginManager
        ).set(
            storagePluginManager.constructor.name,
            storagePluginManager
        );
    }
}

module.exports = Application;