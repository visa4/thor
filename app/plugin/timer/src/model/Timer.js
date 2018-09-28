class Timer {

    constructor() {

        /**
         * @type {number}
         */
        this.startAt = 0;

        /**
         * @type {number}
         */
        this.endAt = 0;

        /**
         * @type string|Object
         */
        this.name = null;

        /**
         * @type {number}
         */
        this.autoStart = 0;

        /**
         * @type string|Object
         */
        this.type = null;

        /**
         * @type string
         */
        this.status = 'idle';

        /**
         * @type {easytimer}
         */
        this.timer = new (require('easytimer.js'))();
    }
}

module.exports = Timer;