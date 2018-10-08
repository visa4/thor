try {
    EvtManager = require('./../../../lib/event/EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

class TimerService {

    static get PLAY()  { return 'play-timer'; }

    static get STOP()  { return 'stop-timer'; }

    static get PAUSE()  { return 'pause-timer'; }

    static get RESUME() { return 'resume-timer'; }

    /**
     * @param {Communicator} communicator
     * @param hydrator
     */
    constructor(communicator, hydrator) {

        /**
         * @type {Communicator}
         */
        this.communicator = communicator;

        /**
         * @type {AbstractHydrator}
         */
        this.hydrator = hydrator;

        /*
         * @type {Object}
         */
        this.activeTimer = {};

        /**
         * Event manager
         */
        this.eventManager = new EvtManager();
    }

    /**
     * @param {Timer} timer
     */
    start(timer) {
        if (this.activeTimer[timer.id] || timer.getStatus() !== Timer.STATUS_IDLE) {
            return;
        }

        this.activeTimer[timer.id] = timer;
        this.activeTimer[timer.id].addEventListener('secondTenthsUpdated', this._progress.bind(this));
        this.activeTimer[timer.id].start()
    };

    /**
     * @param {Timer} timer
     */
    stop(timer) {
        if (!this.activeTimer[timer.id] || timer.getStatus() !== Timer.STATUS_RUNNING) {
            return;
        }

        this.activeTimer[timer.id].removeEventListener('secondTenthsUpdated', this._progress.bind(this));
        this.activeTimer[timer.id].stop();
        delete this.activeTimer[timer.id];
    }

    pause(timer) {
        if (!this.activeTimer[timer.id] || timer.getStatus() !== Timer.STATUS_RUNNING) {
            return;
        }

        this.activeTimer[timer.id].pause();
    }

    resume(timer) {
        if (!this.activeTimer[timer.id] || timer.getStatus() !== Timer.STATUS_PAUSE) {
            return;
        }

        this.activeTimer[timer.id].start();
    }

    /**
     * @param evt
     */
    _progress(evt) {
        console.log('SERVICE TIMER PROGRESS', timer);
        this.eventManager.fire('progress', this.hydrator.extract(timer));
        this.communicator.send(
            'proxy',
            {nameMessage : 'timer-progress', data : this.hydrator.extract(timer)}
        );
    }
}

module.exports = TimerService;