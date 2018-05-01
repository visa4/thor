/**
 *
 */
class TimeslotService {

    constructor(monitorStorage, timeslotStorage) {
        this.monitorStorage = monitorStorage ? monitorStorage : null;
        this.timeslotStorage = timeslotStorage ? timeslotStorage : null;
        this.ipc = require('electron').ipcRenderer;
        this.eventManager = new EvtManager();
        this.runningTimeslots = {};

        /**
         * Listener
         */
        this.eventManager.on(`play-timeslot`, this.changeRunningTimeslot.bind(this));
        this.eventManager.on(`pause-timeslot`, this.changePauseTimeslot.bind(this));
        this.eventManager.on(`stop-timeslot`, this.changeIdleTimeslot.bind(this));
        this.eventManager.on(`resume-timeslot`, this.changeResumeTimeslot.bind(this));
    }

    startSchedule() {
        setInterval(this.schedule.bind(this), 1000);
    }

    schedule() {

        let data = {
            'timestamp' : this._getTimestamp()
        };
  //      console.log('TIMESLOT SCHEDULE', `timeline-${data.timestamp}`);
        this.eventManager.fire(`timeline-${data.timestamp}`, data, true);
        this._updateRunnintTimslots();
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     */
    isRunning(timeslot) {
        return !!(this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`] ||
            this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_DEFAULT}`] ||
            this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`]);
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

        this.ipc.send(
            'start-timeslot',
            {
                'timeslot': timeslot
            }
        );

        this.eventManager.fire('play-timeslot', timeslot);

        this.eventManager.on(
            `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`,
            this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
        )
    }

    /**
     * @param timeslot
     * @param options
     */
    stop(timeslot) {

        this.ipc.send(
            'stop-timeslot',
            {
                'timeslot': timeslot,
            }
        );

        this.eventManager.fire('stop-timeslot', timeslot);
    }

    /**
     * @param timeslot
     * @param options
     */
    pause(timeslot) {

        this.ipc.send(
            'pause-timeslot',
            {
                'timeslot': timeslot,
            }
        );

        this.eventManager.fire('pause-timeslot', timeslot);
    }

    /**
     * @param timeslot
     * @param options
     */
    resume(timeslot) {

        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        this.ipc.send(
            'resume-timeslot',
            {
                'timeslot': timeslot,
            }
        );

        this.eventManager.fire('resume-timeslot', timeslot);


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
}

module.exports = TimeslotService;