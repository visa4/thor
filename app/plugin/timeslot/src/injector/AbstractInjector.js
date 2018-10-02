
class AbstractInjector {

    /**
     * @param {Object} data
     */
    getTimeslotData(data) {
        throw 'method must be override';
    }

    /**
     * @param {Object} data
     */
    extractTimeslot(data) {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceName() {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        throw 'method must be override';
    }
}

module.exports = AbstractInjector;