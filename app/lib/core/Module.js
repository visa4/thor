class Module {

    constructor() {

        /**
         * @type {String|null}
         */
        this.icon = null;

        /**
         * @type {String|null}
         */
        this.name = null;

        /**
         * Name web component use to entry point of the module
         *
         * @type {String|null}
         */
        this.nameWc = null;

        /**
         * @type {String|null}
         */
        this.label = null;

        /**
         * @type {String|null}
         */
        this.configFile = null;

        /**
         * @type {Array}
         */
        this.autoloads = [];

        /**
         * @type {Object}
         */
        this.customeStyle = {};

        // TODO undestand
        // 'plugin': true,
    }
}

module.exports = Module;