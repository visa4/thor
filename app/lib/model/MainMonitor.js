
let Monitor = null;
try {
    Monitor = require('./Monitor');
}
catch(err) {
    Monitor = require(__dirname + '/lib/model/Monitor');
}

/**
 *
 */
class MainMonitor extends Monitor {

    constructor() {
        super();
        this.browserWindows = null;
    }
}

module.exports = MainMonitor;