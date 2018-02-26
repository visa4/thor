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

        this.ipc.send('run-timeslot', timeslot);
    }
}

module.exports = TimeslotService;