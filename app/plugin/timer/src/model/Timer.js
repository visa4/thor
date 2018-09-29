class Timer {

    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

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
        this.type = Timer.TYPE_TIMER;

        /**
         * @type {easytimer}
         */
        this.timer = new (require('easytimer.js'))();

        /**
         * @type {Element}
         */
        this.eventEmitter = document.createElement('span');
    }

    start() {
        this.timer.start();
        this.eventEmitter.dispatchEvent(new CustomEvent('start', this.timer));
    }

    stop() {
        this.timer.stop();
        this.eventEmitter.dispatchEvent(new CustomEvent('stop', this.timer));
    }

    pause() {
        this.timer.pause();
        this.eventEmitter.dispatchEvent(new CustomEvent('pause', this.timer));
    }

    /**
     * @return {string}
     */
    getStatus() {
        let status = 'idle';
        switch (true) {
            case this.timer.isRunning() === true:
                status = 'running';
                break;

            case this.timer.isPaused() === true:
                status = 'pause';
                break;
        }
        return status;
    }

    init() {
        let params = {};
        params.countdown = this.type === Timer.TYPE_TIMER ? false : true;

    }

    /**
     * Proxy
     *
     * @param event
     * @param listener
     */
    addEventListener(event, listener) {
        switch (event) {
            case 'start':
            case 'pause':
            case 'stop':
                this.eventEmitter.addEventListener(event, listener);
                break;

        }
        this.timer.addEventListener(event, listener);
    }

    /**

     *
     * @param event
     * @param listener
     */
    removeEventListener(event, listener) {
        switch (event) {
            case 'start':
            case 'pause':
            case 'stop':
                this.eventEmitter.removeEventListener(event, listener);
                break;

        }
        this.timer.removeEventListener(event, listener);
    }
}

module.exports = Timer;