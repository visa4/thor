/**
 *
 */
class TimeslotSenderService {

    /**
     * @return {string}
     */
    static get TIMESLOT_PLAY() { return 'play-timeslot'; }

    /**
     * @return {string}
     */
    static get TIMESLOT_STOP() { return 'stop-timeslot'; }

    /**
     * @return {string}
     */
    static get TIMESLOT_PAUSE() { return 'pause-timeslot'; }

    /**
     * @return {string}
     */
    static get TIMESLOT_RESUME() { return 'resume-timeslot'; }

    /**
     * Constructor
     */
    constructor() {
        this.ipc = require('electron').ipcRenderer;
    }

    /**
     *
     * @param timeslot
     * @param context
     */
    play(timeslot, context = {}) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_PLAY,
            {
                timeslot : timeslot,
                context : context
            }
        );
    }

    /**
     * @param timeslot
     * @param context
     */
    stop(timeslot, context = {}) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_STOP,
            {
                timeslot : timeslot,
                context : context
            }
        );
    }

    /**
     * @param timeslot
     * @param context
     */
    pause(timeslot, context = {}) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_PAUSE,
            {
                timeslot : timeslot,
                context : context
            }
        );
    }

    /**
     * @param timeslot
     * @param context
     */
    resume(timeslot, context = {}) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_RESUME,
            {
                timeslot : timeslot,
                context : context
            }
        );
    }
}

module.exports = TimeslotSenderService;