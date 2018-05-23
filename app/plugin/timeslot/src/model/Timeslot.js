
class Timeslot {

    /**
     * Constant
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    static get CONTEXT_STANDARD() { return 'standard'; }
    static get CONTEXT_DEFAULT() { return 'default'; }
    static get CONTEXT_OVERLAY() { return 'overlay'; }


    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {String}
         */
        this.status = Timeslot.IDLE;

        /**
         * @type {String}
         */
        this.context = Timeslot.CONTEXT_STANDARD;

        /**
         * @type {null|integer}
         */
        this.duration = null;

        /**
         * @type {boolean}
         */
        this.loop = false;

        /**
         * @type {integer}
         */
        this.currentTime = 0;

        /**
         * @type {Array}
         */
        this.binds = [];

        /**
         *
         * @type {null|Object}
         */
        this.virtualMonitorReference = null;

        /**
         * @type {Array}
         */
        this.resources = [];

        /**
         *
         * @type {{}}
         */
        this.options    = {};

        /**
         * @type {Array}
         */
        this.dataReferences = [];
    }

    /**
     *
     */
    hasResourceType() {
        this.resources.find((resource) => {
            return resource.type.indexOf(type) > -1;
        });
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getOption(name) {
        let option = null;
        if (this.options && typeof this.options === 'object' && this.options[name]) {
            option = this.options[name];
        }
        return option;
    }
}

module.exports = Timeslot;