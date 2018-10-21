class Match {

    constructor() {

        /**
         * @type {Team|Object}
         */
        this.homeTeam = {};

        /**
         * @type {Team|Object}
         */
        this.guestTeam = {};

        /**
         * @type {Date|null}
         */
        this.date = null;

        /**
         * @type {null}
         */
        this.place = null;
    }

    /**
     * @returns {boolean}
     */
    hasHomeTeam() {
        return Object.keys(this.homeTeam).length !== 0 && this.homeTeam.constructor !== Object;
    }

    /**
     * @returns {boolean}
     */
    hasGuestTeam() {
        return Object.keys(this.guestTeam).length !== 0 && this.guestTeam.constructor !== Object;
    }
}

module.exports = Match;