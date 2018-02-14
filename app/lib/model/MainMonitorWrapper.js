/**
 *
 */
class MainMonitorWrapper {

    constructor() {
        this.id    = null;
        this.name  = null;
        this.monitors = [];
    }

    /**
     * @param mainMonitor
     * @returns {MainMonitorWrapper}
     */
    pushMainMonitor (mainMonitor) {
        this.monitors.push(mainMonitor);
        return this;
    }

    /**
     * @returns {Array}
     */
    getMainMonitors() {
        return this.monitors;
    }

    /**
     * @returns {MainMonitorWrapper}
     */
    clearMainMonitors() {
        this.monitors = [];
        return this;
    }

    /**
     * @param id
     * @returns {*}
     */
    getMainMonitor(id) {
        return this.monitors.find(
            (element) => {
                return element.id === id;
            }
        )
    }
}

module.exports = MainMonitorWrapper;