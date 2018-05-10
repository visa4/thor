try {
    EvtManager = require('./../../../lib/event/EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

/**
 *
 */
class TimeslotService {

    static get PLAY()  { return 'play-timeslot'; }

    static get STOP()  { return 'stop-timeslot'; }

    static get PAUSE()  { return 'pause-timeslot'; }

    static get RESUME() { return 'resume-timeslot'; }

    /**
     *
     * @param {TimeslotSenderService} timeslotSender
     * @param {Storage} timeslotStorage
     * @param {Timer} timer
     */
    constructor(timeslotSender, timeslotStorage, timer) {

        /**
         * @type {Timer}
         */
        this.timer = timer;

        /**
         *
         * @type {TimeslotSenderService}
         */
        this.timeslotSender = timeslotSender ? timeslotSender : null;

        /**
         * @type {Storage}
         */
        this.timeslotStorage = timeslotStorage ? timeslotStorage : null;

        /**
         * Event manager
         */
        this.eventManager = new EvtManager();

        /**
         * List running timeslots
         * @type {Object}
         */
        this.runningTimeslots = {};

        /**
         * Listeners
         */
        this.eventManager.on(TimeslotService.PLAY, this.changeRunningTimeslot.bind(this));
        this.eventManager.on(TimeslotService.PAUSE, this.changePauseTimeslot.bind(this));
        this.eventManager.on(TimeslotService.STOP, this.changeIdleTimeslot.bind(this));
        this.eventManager.on(TimeslotService.RESUME, this.changeResumeTimeslot.bind(this));

        if (this.timer) {
            this.timer.addEventListener('secondsUpdated', (evt)  => {
                this.schedule();
            });
        } else {
            throw 'Timer not set';
        }
    }

    schedule() {

        let data = {
            timelineSeconds : this.timer.getTotalTimeValues().seconds
        };

        this.eventManager.fire(`timeline-${data.timelineSeconds}`, data, true);
        this._updateRunnintTimslots();
    }

    /**
     *
     * @param {Timeslot} timeslot
     * @return {boolean}
     */
    isRunning(timeslot) {

        let isRunning = false;
        switch (true) {
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Playlist.CONTEXT_STANDARD}`].id === timeslot.id:
                isRunning = true;
                break;
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`].id === timeslot.id:
                isRunning = true;
                break;
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_DEFAULT}`].id === timeslot.id:
                isRunning = true;
                break;
        }
        return isRunning;
    }

    /**
     *
     * @param timeslot
     * @return {null}
     */
    getRunningTimeslot(monitorId, context) {
        return this.runningTimeslots[`${monitorId}-${context}`];
    }

    /**
     * @param timeslot
     */
    setRunningTimeslot(timeslot) {
       this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${timeslot.context}`] = timeslot;
    }

    /**
     *
     * @param timeslot
     */
    removeRunningTimeslot(timeslot) {

        let nameContext = `${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`;
        if (this.runningTimeslots[nameContext] && this.runningTimeslots[nameContext].id === timeslot.id) {
            delete this.runningTimeslots[nameContext];
        }

        nameContext = `${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`;
        if (this.runningTimeslots[nameContext] && this.runningTimeslots[nameContext].id === timeslot.id) {
            delete this.runningTimeslots[nameContext];
        }
    }

    /**
     * @param timeslot
     */
    play(timeslot) {

        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        timeslot.options.typeService = 'timeslot';
        this._executeBids(timeslot, 'play');
        this.timeslotSender.play(timeslot);
        this.eventManager.fire(TimeslotService.PLAY, timeslot);
        this.eventManager.on(
            `timeline-${this.timer.getTotalTimeValues().seconds + parseInt(timeslot.duration)}`,
            this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
        )
    }

    /**
     * @param timeslot
     */
    stop(timeslot) {

        timeslot.options.typeService = 'timeslot';

        this._executeBids(timeslot, 'stop');
        this.timeslotSender.stop(timeslot);
        this.eventManager.fire(TimeslotService.STOP, timeslot);
    }

    /**
     * @param timeslot
     */
    pause(timeslot) {

        timeslot.options.typeService = 'timeslot';
        this._executeBids(timeslot, 'pause');
        this.timeslotSender.pause(timeslot);
        this.eventManager.fire(TimeslotService.PAUSE, timeslot);
    }

    /**
     * @param timeslot
     */
    resume(timeslot) {

        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        timeslot.options.typeService = 'timeslot';
        this._executeBids(timeslot, 'resume');
        this.timeslotSender.resume(timeslot);
        this.eventManager.fire(TimeslotService.RESUME, timeslot);

        this.eventManager.on(
            `timeline-${this.timer.getTotalTimeValues().seconds + parseInt(timeslot.duration) - timeslot.currentTime}`,
            this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
        )
    }


    /**
     *
     * @param evt
     */
    processTimeslot(evt) {
        if (!this.timeslotService.isRunning(this.timeslot)) {
            console.log('TIMESLOT NOT RUNNING', this.timeslot);
            return;
        }

        let runningTimeslot =  this.timeslotService
            .getRunningTimeslot(this.timeslot.virtualMonitorReference.monitorId, this.timeslot.context);

        console.log('PROCESS TIMESLOT',runningTimeslot);
        this.timeslotService.eventManager._consoleDebug();

        switch (true) {
            case runningTimeslot && runningTimeslot.currentTime < (parseInt(runningTimeslot.duration)-1):
                console.log('NON ANCORA',runningTimeslot, runningTimeslot.currentTime, (parseInt(runningTimeslot.duration)-1));
                break;
            case this.timeslot.loop === true:
                this.timeslotService.play(this.timeslot);
                break;
            case runningTimeslot !== undefined:
                this.timeslotService.stop(this.timeslot);
                break
        }

    }

    /**
     * @param evt
     */
    changeRunningTimeslot(evt) {
        console.log('START TIMESLOT',  evt.data);

        this.setRunningTimeslot(evt.data);
        evt.data.status = Timeslot.RUNNING;
        evt.data.currentTime = 0;
        this.timeslotStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @param evt
     */
    changeResumeTimeslot(evt) {
        console.log('RESUME TIMESLOT',  evt.data.id);

        evt.data.status = Timeslot.RUNNING;
        this.setRunningTimeslot(evt.data);
        this.timeslotStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    changePauseTimeslot(evt) {
        console.log('PAUSE TIMESLOT',  evt.data.id);

        this.removeRunningTimeslot(evt.data);
        evt.data.status = Timeslot.PAUSE;

        this.timeslotStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @param evt
     */
    changeIdleTimeslot(evt) {
        console.log('STOP TIMESLOT',  evt.data.id);
        this.removeRunningTimeslot(evt.data);

        evt.data.status = Timeslot.IDLE;
        evt.data.currentTime = 0;
        this.timeslotStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @private
     */
    _updateRunnintTimslots() {

        for (let key in this.runningTimeslots) {
            if (this.runningTimeslots[key].currentTime + 1 >= this.runningTimeslots[key].duration) {
                continue;
            }

            this.runningTimeslots[key].currentTime++;
            this.timeslotStorage.update(this.runningTimeslots[key])
                .then((data) => {})
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @param timeslot
     * @param method
     * @private
     */
    _executeBids(timeslot, method) {

        if (timeslot.binds.length === 0) {
            return;
        }

        for (let cont = 0; timeslot.binds.length > cont; cont++) {
            this[method](timeslot.binds[cont]);
        }
    }
}

module.exports = TimeslotService;