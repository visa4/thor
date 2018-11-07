try {
    Match = require('./../../../../lib/sport/model/Match');

}
catch(err) {
    Match = require(__dirname + '/lib/sport/model/Match');

}

class MatchSoccer extends Match {

    constructor() {
        super();


        /**
         * @type {TeamSoccer}
         */
        this.homeTeam = new TeamSoccer();

        /**
         * @type {TeamSoccer}
         */
        this.guestTeam = new TeamSoccer();

        /**
         * @type {number}
         */
        this.enable = 0;
    }

    getHomeResult() {
        return this._getResult(true);
    }

    getGuestResult() {
        return this._getResult(false);
    }

    /**
     * @param isHome
     * @private
     */
    _getResult(isHome = true) {

        let goalTeam = isHome ? 'homeTeam' : 'guestTeam';
        let autoGoal = isHome ? 'guestTeam' : 'homeTeam';
        let result = 0;

        for (let cont = 0; this[goalTeam].players.length > cont; cont++) {
            if (this[goalTeam].players[cont].goals.length === 0) {
                continue;
            }

            for (let cont1 = 0; this[goalTeam].players[cont].goals.length > cont1; cont1++) {
                if (this[goalTeam].players[cont].goals[cont1].type === Goal.TYPE_STANDARD) {
                    result++
                }
            }
        }

        for (let cont = 0; this[autoGoal].players.length > cont; cont++) {
            if (this[autoGoal].players[cont].goals.length === 0) {
                continue;
            }

            for (let cont1 = 0; this[autoGoal].players[cont].goals.length > cont1; cont1++) {
                if (this[autoGoal].players[cont].goals[cont1].type === Goal.TYPE_AUTO) {
                    result++
                }
            }
        }
        return result;
    }
}

module.exports = MatchSoccer;