try {
    EvtManager = require('./../../../lib/event/EvtManager');
    TimeslotSenderService = require('./TimeslotSenderService');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

/**
 *
 */
class TimeslotService {

    /**
     *
     * @param {TimeslotSenderService} timeslotSender
     * @param {Storage} timeslotStorage
     * @param {Timer} timer
     */
    constructor(timeslotSender, timeslotStorage, timer) {

        /**
         * @type {timer}
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
        this.eventManager.on(TimeslotSenderService.TIMESLOT_PLAY, this.changeRunningTimeslot.bind(this));
        this.eventManager.on(TimeslotSenderService.TIMESLOT_PAUSE, this.changePauseTimeslot.bind(this));
        this.eventManager.on(TimeslotSenderService.TIMESLOT_STOP, this.changeIdleTimeslot.bind(this));
        this.eventManager.on(TimeslotSenderService.TIMESLOT_RESUME, this.changeResumeTimeslot.bind(this));
    }

    startSchedule() {
        setInterval(this.schedule.bind(this), 1000);
    }

    schedule() {

        let data = {
            'timestamp' : this._getTimestamp()
        };

        // console.log('TIMESLOT SCHEDULE', `timeline-${data.timestamp}`);
        this.eventManager.fire(`timeline-${data.timestamp}`, data, true);
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

        this.timeslotSender.play(timeslot);
        this.eventManager.fire(TimeslotSenderService.TIMESLOT_PLAY, timeslot);
        this.eventManager.on(
            `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`,
            this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
        )
    }

    /**
     * @param timeslot
     */
    stop(timeslot) {

        this.timeslotSender.stop(timeslot);
        this.eventManager.fire(TimeslotSenderService.TIMESLOT_STOP, timeslot);
    }

    /**
     * @param timeslot
     */
    pause(timeslot) {

        this.timeslotSender.pause(timeslot);
        this.eventManager.fire(TimeslotSenderService.TIMESLOT_PAUSE, timeslot);
    }

    /**
     * @param timeslot
     */
    resume(timeslot) {

        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        this.timeslotSender.resume(timeslot);
        this.eventManager.fire(TimeslotSenderService.TIMESLOT_RESUME, timeslot);

        this.eventManager.on(
            `timeline-${this._getTimestamp() + parseInt(timeslot.duration) - timeslot.currentTime}`,
            this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
        )
    }

    /**
     * @return {number}
     * @private
     */
    _getTimestamp() {
        return Math.round(new Date() / 1000);
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
            case this.timeslot.loop === true:
                this.timeslotService.play(this.timeslot);
                break;
            case runningTimeslot && runningTimeslot.currentTime < (parseInt(runningTimeslot.duration)-1):
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
        if (evt.data.binds.length > 0) {
            for (let cont = 0; evt.data.binds.length > cont; cont++) {
                this.play(evt.data.binds[cont]);
            }
        }

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

        if (evt.data.binds.length > 0) {
            for (let cont = 0; evt.data.binds.length > cont; cont++) {
                this.resume(evt.data.binds[cont]);
            }
        }

        evt.data.status = Timeslot.RUNNING;
        this.setRunningTimeslot(evt.data);
        this.timeslotStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    changePauseTimeslot(evt) {
        console.log('PAUSE TIMESLOT',  evt.data.id);

        if (evt.data.binds.length > 0) {
            for (let cont = 0; evt.data.binds.length > cont; cont++) {
                this.pause(evt.data.binds[cont]);
            }
        }

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

        if (evt.data.binds.length > 0) {
            for (let cont = 0; evt.data.binds.length > cont; cont++) {
                this.stop(evt.data.binds[cont]);
            }
        }

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
}

module.exports = TimeslotService;