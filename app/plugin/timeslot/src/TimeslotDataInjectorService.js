try {
    TimeslotDataServicePluginManager = require('./TimeslotDataServicePluginManager');
}
catch(err) {

    TimeslotDataServicePluginManager = require(__dirname + '/TimeslotDataServicePluginManager');
}

/**
 *
 */
class TimeslotDataInjectorService {

    constructor(timeslotDataServicePluginManager) {
        this.timeslotDataServicePluginManager = timeslotDataServicePluginManager ?
            timeslotDataServicePluginManager : TimeslotDataServicePluginManager.getInstance();
    }

    getData(timeslot) {

    }
}

module.exports = TimeslotDataInjectorService;