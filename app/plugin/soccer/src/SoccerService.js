/**
 *
 */
class SoccerService {

    constructor(storage) {

        /**
         *
         * @type {MatchSoccer}|{}
         */
        this.match = {};

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
                    break;
            }
        });
    }

    /**
     * @param evt
     * @private
     */
    _checkChangeEnableMatch(evt) {

        if (evt.data.enable  !== 1) {
            return;
        }

        this.match = evt.data;
    }
}

module.exports = SoccerService;