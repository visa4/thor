/**
 *
 */
class VirtualMonitor {

    constructor() {
        this.id    = null;
        this.name  = null;
        this.monitors = [];
    }

    /**
     * @param monitor
     * @returns {VirtualMonitor}
     */
    pushMonitor (monitor) {
        this.monitors.push(monitor);
        return this;
    }

    /**
     * @returns {Array}
     */
    getMonitors() {
        return this.monitors;
    }

    /**
     * @returns {VirtualMonitor}
     */
    clearMonitors() {
        this.monitors = [];
        return this;
    }

    /**
     * @param id
     * @returns {*}
     */
    getMonitor(id) {
        return this.monitors.find(
            (element) => {
                return element.id === id;
            }
        )
    }
}

module.exports = VirtualMonitor;