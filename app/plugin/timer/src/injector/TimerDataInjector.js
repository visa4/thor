
class TimerDataInjector extends AbstractInjector {

    constructor(timerStorage) {
        super();

        this.storage = timerStorage;
    }

    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        return this.storage.getAll({name: value});
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        return new Promise((resolve, reject) => {

            this.storage.get(data.id).then(function(data) {

                let obj = {};
                obj[this.serviceNamespace()] = data;
                resolve(obj);
            }.bind(this)).catch((err) => {
                reject(err);
            })
        });
    }

    /**
     * @param {Timer} timer
     */
    extractTimeslot(timer) {
        return {'id' : timer.id};
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

    serviceNamespace () {
        return 'timer';
    }
}

module.exports = TimerDataInjector;