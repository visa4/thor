
class Timeslot {

    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

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

    remove() {

        
    }

    append(timeslot, index) {

    }

    getMonitorId() {

    }

    getDuration() {

    }
}

module.exports = Timeslot;