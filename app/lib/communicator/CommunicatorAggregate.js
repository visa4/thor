class CommunicatorAggregate {

    /**
     * @param {Array} adapters
     * @param {Object} strategy
     */
    constructor (adapters, strategy) {

        /**
         *
         */
        this.adapters = adapters;

        /**
         *
         */
        this.strategy = strategy;
    }

    /**
     *
     * @param evt
     * @param data
     */
    send(evt, data) {

         for (let cont = 0; this.adapters.length > cont; cont++) {
             this.adapters[cont].send(evt, data);
         }
    }
}


module.exports = CommunicatorAggregate;