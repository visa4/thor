class TimerService {

    /**
     * @param {Communicator} communicator
     * @param hydrator
     */
    constructor(communicator, hydrator) {
        this.communicator = communicator;
        this.hydrator = hydrator;
    }

    /**
     * @param {Timer} timer
     */
    progress(timer) {
        this.communicator.send(
            'proxy',
            {nameMessage : 'timer-progress', data : this.hydrator.extract(timer)}
        );
    }
}

module.exports = TimerService;