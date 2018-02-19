/**
 *
 */
class EvtManager {

    /**
     * Constructor
     */
    constructor() {
        this.queues = {};
    }

    /**
     * @param event
     * @param action
     */
    on(event, action) {

        if (!this.queues[event]) {
            this.queues[event] = [];
        }

        this.queues[event].push(new EvtExecution(action));
    }

    /**
     * @param event
     * @param params
     */
    fire(event, params) {

        if (this.queues[event]) {
            let eventObject = new Evt(event, params);
            for (let cont = 0; this.queues[event].length > cont; cont++) {
                this.queues[event][cont].execute(eventObject);
                if (eventObject.stopPropagation) {
                    break;
                }
            }
        }
    }
}

module.exports = EvtManager;