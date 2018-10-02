
class TimerDataInjector extends AbstractInjector {

    constructor() {
        super();
    }

    /**
     * @param {Object} data
     */
    getTimeslotData(data) {
       return [
           {'name' : 'test'}
       ]
    }

    /**
     * @param {Object} data
     */
    extractTimeslot(data) {
        return [
            {'name' : 'test'}
        ]
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'TimerDataInjector';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return TimerDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Timer metadata';
    }
}

module.exports = TimerDataInjector;