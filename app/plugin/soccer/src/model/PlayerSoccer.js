try {
    Player = require('./../../../../lib/sport/model/Player');

}
catch(err) {
    Player = require(__dirname + '/lib/sport/model/Player');

}

class PlayerSoccer extends Player {

    constructor() {
        super();

        this.goals = [];
    }
}

module.exports = PlayerSoccer;