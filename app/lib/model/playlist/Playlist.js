
class Playlist {

    /**
     * @return {string}
     * @constructor
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    constructor() {

        this.name       = null;
        this.status     = null;

        this.timeslots = [];
    }

    /**
     * @return {Number}
     */
    getDuration() {

        let duration = 0;
        for (let cont = 0; this.timeslots.length > cont; cont++) {
            duration = duration + this.timeslots[cont].duration;
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
        return index > -1 ? true : false;
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
}

module.exports = Playlist;