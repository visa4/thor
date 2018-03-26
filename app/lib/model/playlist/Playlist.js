
class Timeslot {

    constructor() {

        this.name       = null;

        this.monitor    = null;

        this.resources  = [];

        this.duration   = null;

        /**
         * options.loop    = true|false
         * options.context = ['standard', 'overlay']
         *
         * @type {{}}
         */
        this.options    = {};
    }
}

module.exports = Timeslot;