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
    run(timeslot, options) {

        this.ipc.send(
            'start-timeslot',
            {
                'timeslot': timeslot,
                'options': {'test':'test'}
            }
        );
    }
}

module.exports = TimeslotService;