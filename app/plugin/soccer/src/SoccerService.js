/**
 *
 */
class SoccerService {

    static get UPDATE_CURRENT_MATCH() { return 'update-current-match' };

    constructor(storage) {

        /**
         *
         * @type {MatchSoccer}|{}
         */
        this.match = new MatchSoccer();

        /**
         * @param {Storage}
         */
        this.storage = storage;

        this.storage.eventManager.on(Storage.STORAGE_POST_UPDATE, this._checkChangeEnableMatch.bind(this));
        this.storage.getAll({enable: 1}).then((enableMatchs) => {

            switch (enableMatchs.length) {
                case 2:
                    console.error('Must be present 0 or 1 enable match')
                    break;
                case 1:
                    this.match = enableMatchs[0];
                    this.match.guestTeam.getPlayers({sort:'position'});
                    this.match.homeTeam.getPlayers({sort:'position'});
                    break;
            }
        });

        this.eventManager = new EvtManager();
    }

    /**
     * @param evt
     * @private
     */
    _checkChangeEnableMatch(evt) {

       switch (true) {
           case this.match.id === evt.data.id && evt.data.enable === 0 :
               this.match = new MatchSoccer();
               this.eventManager.fire(SoccerService.UPDATE_CURRENT_MATCH, this.match);
               break;
           case evt.data.enable === 1 && evt.data.id !== this.match.id :
               this.match = evt.data;
               this.match.guestTeam.getPlayers({sort:'position'});
               this.match.homeTeam.getPlayers({sort:'position'});
               this.eventManager.fire(SoccerService.UPDATE_CURRENT_MATCH, this.match);
               break;
       }
    }

    /**
     * @returns {MatchSoccer}
     */
    getCurrentMatch() {
        return this.match;
    }
}

module.exports = SoccerService;