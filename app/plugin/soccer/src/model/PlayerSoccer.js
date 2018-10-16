try {
    Player = require('./../../../../lib/sport/model/Player');

}
catch(err) {
    Player = require(__dirname + '/lib/sport/model/Player');

}

class PlayerSoccer extends Player {

    constructor() {
        super();

        /**
         * @type {null|String}
         */
        this.shirtName = null;

        /**
         * @type {null|Number}
         */
        this.shirtNumber = null;

        /**
         * @type {null|string}
         */
        this.position = null;

        /**
         * @type {Array}
         */
        this.goals = [];
    }
}

module.exports = PlayerSoccer;