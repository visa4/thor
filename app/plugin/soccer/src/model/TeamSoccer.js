try {
    Team = require('./../../../../lib/sport/model/Team');

}
catch(err) {
    Team = require(__dirname + '/lib/sport/model/Team');

}

class TeamSoccer extends Team {

    constructor() {
        super();

        this.isHome = true;
    }
}

module.exports = TeamSoccer;