/**
 *
 */
class Configuration {

    constructor(data) {

        if (data === null || data === undefined) {
            return
        }

        this.monitors = [];
        this.enable   = false;
        this.name     = null;

        if (data.monitors) {
            this.monitors = data.monitors;
        }

        if (data.enable) {
            this.enable = data.enable;
        }

        if (data.name) {
            this.name = data.name;
        }
    }
}