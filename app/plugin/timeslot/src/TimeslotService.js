/**
 *
 */
class TimeslotService {

    constructor(monitorStorage) {
        this.monitorStorage = monitorStorage ? monitorStorage : null;
        this.ipc = require('electron').ipcRenderer;
    }

    /**
     *
     * @param timeslot
     * @param options
     */
    play(timeslot, options) {

        options = options !== null && typeof options === 'object' ? options : {};

        this.ipc.send(
            'start-timeslot',
            {
                'timeslot': timeslot,
                'options': options
            }
        );
    }
}

module.exports = TimeslotService;