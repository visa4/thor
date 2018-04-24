
class Timeslot {

    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {null|integer}
         */
        this.duration = null;

        /**
         * @type {Array}
         */
        this.bind = [];

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
         * options.loop    = true|false
         * options.context = ['standard', 'overlay']
         *
         * @type {{}}
         */
        this.options    = {};
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