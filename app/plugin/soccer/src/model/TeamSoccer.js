try {
    Team = require('./../../../../lib/sport/model/Team');

}
catch(err) {
    Team = require(__dirname + '/lib/sport/model/Team');

}

class TeamSoccer extends Team {

    static get NUMBER_HOLDER() { return 11; };

    constructor() {
        super();
    }

    /**
     * @param playerId
     * @param status
     * @return {PlayerSoccer}|null
     */
    setStatusPlayer(playerId, status) {

        let player = null;
        let searchPlayer = this.players.find((ele) => {
            return ele.id === playerId;
        });

        if (!searchPlayer) {
            return player;
        }


        if (status === PlayerSoccer.STATUS_HOLDER) {
            if(this.countPlayer({status:PlayerSoccer.STATUS_HOLDER}) < TeamSoccer.NUMBER_HOLDER) {

                if (searchPlayer) {
                    player = searchPlayer;
                    player.status = status;
                }
            }
        } else {
            player = searchPlayer;
            player.status = status;
        }

        return player;
    }

    /**
     * @return {number}
     */
    countPlayer(options) {
        let count = 0;
        for (let cont = 0; this.players.length > cont; cont++) {
            switch (true) {
                case typeof options === 'object' && options.status === PlayerSoccer.STATUS_HOLDER && this.players[cont].status === PlayerSoccer.STATUS_HOLDER :
                    console.log('suca', this.players[cont].status);
                    count++;
                    break;
                    // TODO other count
                case typeof options === 'undefined':
                    count++;
            }
        }

        return count;
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

    /**
     * @return {number}
     */
    getResult() {
        return 0;
    }
}

module.exports = TeamSoccer;