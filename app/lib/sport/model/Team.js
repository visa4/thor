class Team {

    constructor() {

        /**
         * @type {null|String}
         */
        this.name = null;

        /**
         * @type {null|String}
         */
        this.logo = null;

        /**
         * @type {null|Array}
         */
        this.players = [];

        /**
         * @type {null|String}
         */
        this.staff = [];
    }

    /**
     * @param {Player} player
     * @returns {Team}
     */
    addPlayer(player) {
        this.players.push(player);
        return this;
    }

    /**
     * @param {Player} player
     * @returns {Team}
     */
    removePlayer(player) {
        let index = this.players.findIndex((element) => {
            return element.id === player.id;
        });

        if (index > -1 ) {
            this.players.splice(index, 1);
        }
        return this;
    }

    /**
     * @returns {Array}
     */
    getPlayers() {
        return this.players;
    }
}

module.exports = Team;