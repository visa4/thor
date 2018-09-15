/**
 *
 */
class Monitor {

    constructor() {
        this.name    = null;
        this.height  = 0;
        this.width   = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.backgroundColor = 'transparent';
        /**
         * TODO now string but in the future will be an array of point
         * @type {null}
         */
        this.polygon = null;
        this.monitors = [];

        this.defaultTimeslotId = null;
    }

    /**
     *
     * @param options
     * @return {Array}
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
     * @param monitor
     * @returns {VirtualMonitor}
     */
    pushMonitor (monitor) {
        this.monitors.push(monitor);
        return this;
    }


}

module.exports = Monitor;