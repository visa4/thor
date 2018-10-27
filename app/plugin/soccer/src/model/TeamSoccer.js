try {
    Team = require('./../../../../lib/sport/model/Team');

}
catch(err) {
    Team = require(__dirname + '/lib/sport/model/Team');

}

class TeamSoccer extends Team {

    constructor() {
        super();
    }

    getPlayers(options) {

        if(options && options.sort === 'position') {
            let list =  this.players.sort((elem1, elem2) =>{

                let value = 1;
                switch (elem1.position) {
                    case PlayerSoccer.POSITION_GAOLKEEPER:
                        value = -1;
                        break;
                    case PlayerSoccer.POSITION_DEFENDER:
                        switch (elem2.position) {
                            case PlayerSoccer.POSITION_DEFENDER:
                                value =  0;
                                break;
                            case PlayerSoccer.POSITION_GAOLKEEPER:
                                value = 1;
                                break;
                            case PlayerSoccer.POSITION_MIDFIELDER:
                            case PlayerSoccer.POSITION_STRIKER:
                                value = -1;
                                break;
                        }

                        break;
                    case PlayerSoccer.POSITION_MIDFIELDER:

                        switch (elem2.position) {
                            case PlayerSoccer.POSITION_MIDFIELDER:
                                value =  0;
                                break;
                            case PlayerSoccer.POSITION_DEFENDER:
                            case PlayerSoccer.POSITION_GAOLKEEPER:
                                value = 1;
                                break;
                            case PlayerSoccer.POSITION_STRIKER:
                                value = -1;
                                break;
                        }

                        break;
                    case PlayerSoccer.POSITION_STRIKER:
                        value = 1;
                }

                return value;
            });
        }

        return super.getPlayers();
    }
}

module.exports = TeamSoccer;