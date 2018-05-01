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
     * @param monitor
     */
    removeMonitor(monitor) {
        if (monitor === null || typeof monitor !== 'object' ) {
            throw 'wrong input for removeMonitor';
        }

        for (let cont = 0; this.monitors.length > cont; cont++) {
            if (this.monitors[cont].id === monitor.id) {
                this.monitors.splice(cont, 1);
            }

            if (typeof this.monitors[cont].getMonitors === "function") {
                let nestedMonitor = this.monitors[cont].getMonitors({nested: true});
                for (let cont2 = 0; nestedMonitor.length > cont2; cont2++) {
                    if (nestedMonitor[cont2].id === monitor.id) {
                        nestedMonitor.splice(cont2, 1);
                    }
                }
            }
        }
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

    /**
     *
     * @param id
     * @return {*}
     */
    getMainMonitor(id) {
        let mainMonitor = null;
        let find;

        for (let cont = 0; this.monitors.length > cont; cont++) {

            if (this.monitors[cont].id === id) {
                mainMonitor = this.monitors[cont];
                break;
            }

            let subMonitors = this.monitors[cont].getMonitors({nested:true});

            find = subMonitors.find(
                (element) => {
                    return element.id === id;
                }
            );

            if (find) {
                mainMonitor = this.monitors[cont];
                break;
            }
        }
        return mainMonitor;
    }

}

module.exports = VirtualMonitor;