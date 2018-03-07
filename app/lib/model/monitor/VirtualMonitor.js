/**
 *
 */
class VirtualMonitor {

    constructor() {
        this.id    = null;
        this.name  = null;
        this.enable = false;
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
    getMonitors(options) {
        let monitors = this.monitors;
        if (options && typeof options === 'object' && options.nested) {
           for (let cont = 0; this.monitors.length > cont; cont++) {
               if (typeof this.monitors[cont].getMonitors === "function") {
                   let nestedMonitor = this.monitors[cont].getMonitors(options);
                   if (nestedMonitor.length > 0) {
                       monitors = monitors.concat(nestedMonitor);
                   }
               }
           }
        }
        return monitors;
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