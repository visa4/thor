
class Playlist {

    /**
     * Constant
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    /**
     * @return {string}
     * @constructor
     */
    constructor() {

        /**
         * @type {String}
         */
        this.name = null;

        /**
         * @type {String}
         */
        this.status = Playlist.IDLE;

        /**
         * @type {number}
         */
        this.currentIndex = 0;

        /**
         * @type {Array}
         */
        this.timeslots = [];

        /**
         * options.loop    = true|false
         * options.context = ['standard', 'overlay']
         *
         * @type {{}}
         */
        this.options = {};
    }

    /**
     * @return {Number}
     */
    getDuration() {

        let duration = 0;
        for (let cont = 0; this.timeslots.length > cont; cont++) {
            duration = duration + parseInt(this.timeslots[cont].duration);
        }
        return duration;
    }

    /**
     * @return {Number}
     */
    count() {
        return this.timeslots.length;
    }

    /**
     * @param timeslot
     * @return {Playlist}
     */
    append(timeslot) {
        //  TODO check if timeslot is correct
        this.timeslots.push(timeslot);
        return this;
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     */
    remove(timeslot) {
        //  TODO check if timeslot is correct
        let index  = this.timeslots.findIndex(element => element.id === timeslot.id);
        if (index > -1) {
            this.timeslots.slice(index, 1);
        }
        return index > -1;
    }

    /**
     *
     * @return {*}
     */
    current() {
        let timeslot = null;
        if (this.currentIndex < this.timeslots.length) {
            timeslot = this.timeslots[this.currentIndex];
        }
        return timeslot;
    }

    /**
     * @return {*}
     */
    next() {
        let timeslot = null;
        this.currentIndex++;
        if (this.currentIndex < this.timeslots.length) {
            timeslot = this.timeslots[this.currentIndex];
        }
        return timeslot;
    }

    /**
     *
     */
    reset() {
        this.currentIndex = 0;
    }

    /**
     * @return {String|null}
     */
    getMonitorId() {
        let monitorId = null;
        if (this.timeslots.length > 0) {
            monitorId = this.timeslots[0].virtualMonitorReference.monitorId;
        }
        return monitorId
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     * @private
     */
    _isValidTimeslot(timeslot) {
        let check = true;
        switch (true) {
            case timeslot === null:
            case typeof timeslot !== 'object':
            case !timeslot.monitor || !timeslot.monitor.id:
            case this.timeslots.length < 1 || !this.timeslots[0].monitor || this.timeslots[0].monitor.id !== timeslot.monitor.id:
                check = false;
                break
        }
        return check;
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getOption(name) {
        let option = null;
        if (this.options && typeof this.options === 'object' && this.options[name]) {
            option = this.options[name];
        }
        return option;
    }
}

module.exports = Playlist;