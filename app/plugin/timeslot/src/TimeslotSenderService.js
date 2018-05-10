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
     * @param timeslot
     */
    play(timeslot) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_PLAY,
            {
                'timeslot': timeslot
            }
        );
    }

    /**
     * @param timeslot
     */
    stop(timeslot) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_STOP,
            {
                'timeslot': timeslot,
            }
        );
    }

    /**
     * @param timeslot
     */
    pause(timeslot) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_PAUSE,
            {
                'timeslot': timeslot,
            }
        );
    }

    /**
     * @param timeslot
     */
    resume(timeslot) {

        this.ipc.send(
            TimeslotSenderService.TIMESLOT_RESUME,
            {
                'timeslot': timeslot,
            }
        );
    }
}

module.exports = TimeslotSenderService;