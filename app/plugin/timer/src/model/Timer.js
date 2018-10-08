class Timer {

    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

    static get STATUS_IDLE()  { return 'idle'; }

    static get STATUS_RUNNING()  { return 'running'; }

    static get STATUS_PAUSE()  { return 'pause'; }

    constructor() {

        /**
         * @type {Object}
         */
        this.startAt = {};

        /**
         * @type {Object}
         */
        this.endAt = {};

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
        this.type = Timer.TYPE_TIMER;

        /**
         * @type {easytimer}
         */
        this.timer = new (require('easytimer.js'))();
        this.timer.addEventListener('secondTenthsUpdated', this.proxy.bind(this));

       // secondTenthsUpdated
            //secondsUpdated
        //minutesUpdated
       // hoursUpdated
       //daysUpdated

        //stopped
        //reset

        //started

        //paused

    }

    _startConfig() {
        let params = {};

        params.countdown = this.type === Timer.TYPE_TIMER ? false : true;
        params.startValues = this.startAt;
        params.target = this.endAt;
        return params;
    }

    start() {
        this.timer.start(this._startConfig());
    }

    stop() {
        this.timer.stop();
    }

    pause() {
        this.timer.pause();
    }

    /**
     * @return {string}
     */
    getStatus() {
        let status = Timer.STATUS_IDLE;
        switch (true) {
            case this.timer.isRunning() === true:
                status = Timer.STATUS_RUNNING;
                break;

            case this.timer.isPaused() === true:
                status = Timer.STATUS_PAUSE;
                break;
        }
        return status;
    }

    /**
     * Proxy
     *
     * @param event
     * @param listener
     */
    addEventListener(event, listener) {
        this.timer.addEventListener(event, listener);
    }

    /**
     * Proxy
     *
     * @param event
     * @param listener
     */
    removeEventListener(event, listener) {
        this.timer.removeEventListener(event, listener);
    }
}

module.exports = Timer;