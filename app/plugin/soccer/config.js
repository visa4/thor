/**
 *
 */
class SoccerConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'match.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'match.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'match'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                }
            }
        }
    }

    /**
     * @private
     */
    _loadHydrator() {

        /**
         *
         */
        this._loadTamHydrator();

        let hydrator = new PropertyHydrator(
            new MatchSoccer(),
            {
                enable : new NumberStrategy(),
                guestTeam : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('teamSoccerHydrator')
                ),
                homeTeam: new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('teamSoccerHydrator')
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('place')
            .enableExtractProperty('date')
            .enableExtractProperty('time')
            .enableExtractProperty('enable')
            .enableExtractProperty('guestTeam')
            .enableExtractProperty('homeTeam');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('place')
            .enableHydrateProperty('date')
            .enableHydrateProperty('time')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('guestTeam')
            .enableHydrateProperty('homeTeam');

        this.serviceManager.get('HydratorPluginManager').set(
            'matchSoccerHydrator',
            hydrator
        );
    }

    /**
     * @private
     */
    _loadStorage() {

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
                        {
                            "name": SoccerConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "place", "date", "homeTeam", "guestTeam", "enable", "status"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let SoccerDexieCollection = require('../soccer/src/storage/indexed-db/dexie/SoccerDexieCollection');

                            let storage = new Storage(
                                new SoccerDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    SoccerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('matchSoccerHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SoccerConfig.NAME_SERVICE,
                                storage
                            );

                            serviceManager.set(
                                'SoccerService',
                                new SoccerService(storage)
                            );



                        }.bind(this)
                    );
                }
            }
        );
    }

    _loadPlayerHydrator() {

        this._loadCardHydrator();

        let hydrator = new PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new NumberStrategy(),
                cards: new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('cardSoccerHydrator')
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('surname')
            .enableExtractProperty('shirtName')
            .enableExtractProperty('shirtNumber')
            .enableExtractProperty('position')
            .enableExtractProperty('nationality')
            .enableExtractProperty('goals')
            .enableExtractProperty('cards')
            .enableExtractProperty('status');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('surname')
            .enableHydrateProperty('shirtName')
            .enableHydrateProperty('position')
            .enableHydrateProperty('shirtNumber')
            .enableHydrateProperty('nationality')
            .enableHydrateProperty('goals')
            .enableHydrateProperty('cards')
            .enableHydrateProperty('status')
        ;

        this.serviceManager.get('HydratorPluginManager').set(
            'playerSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new NumberStrategy(),
            },
            {
                identifier : 'id',
                number: "shirtNumber",
                fullname: "surname"
            }
        );

        hydrator.enableExtractProperty('identifier')
            .enableExtractProperty('name')
            .enableExtractProperty('surname')
            .enableExtractProperty('shirtName')
            .enableExtractProperty('shirtNumber')
            .enableExtractProperty('position')
            .enableExtractProperty('nationality')
            .enableExtractProperty('goals');

        hydrator.enableHydrateProperty('identifier')
            .enableHydrateProperty('name')
            .enableHydrateProperty('fullname')
            .enableHydrateProperty('shirtName')
            .enableHydrateProperty('position')
            .enableHydrateProperty('number')
            .enableHydrateProperty('nationality')
            .enableHydrateProperty('goals');

        this.serviceManager.get('HydratorPluginManager').set(
            'playerSoccerApiHydrator',
            hydrator
        );
    }

    _loadTamHydrator() {

        this._loadPlayerHydrator();

        this._loadReplacementHydrator();

        let hydrator = new PropertyHydrator(
                new TeamSoccer(),
                {
                    'players' : new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                    ),
                    'replacemens' :  new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('replacementSoccerHydrator')
                    ),
                }
            );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('logo')
            .enableExtractProperty('players')
            .enableExtractProperty('staff')
            .enableExtractProperty('replacemens');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('log')
            .enableHydrateProperty('players')
            .enableHydrateProperty('staff')
            .enableHydrateProperty('replacemens');

        this.serviceManager.get('HydratorPluginManager').set(
            'teamSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new TeamSoccer(),
            {
                'players' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerApiHydrator')
                ),
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('logo')
            .enableExtractProperty('players')
            .enableExtractProperty('staff');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('log')
            .enableHydrateProperty('players')
            .enableHydrateProperty('staff');

        this.serviceManager.get('HydratorPluginManager').set(
            'teamSoccerApiHydrator',
            hydrator
        );
    }

    _loadCardHydrator() {

        let hydrator = new PropertyHydrator(
            new Card()
        );

        hydrator.enableExtractProperty('type')
            .enableExtractProperty('time');

        hydrator.enableHydrateProperty('type')
            .enableHydrateProperty('time');

        this.serviceManager.get('HydratorPluginManager').set(
            'cardSoccerHydrator',
            hydrator
        );
    }

    _loadReplacementHydrator() {
        let hydrator = new PropertyHydrator(
            new Replacement(),
            {
                'playerOut' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                ),
                'playerIn' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                ),
            }
        );

        hydrator.enableExtractProperty('playerIn')
            .enableExtractProperty('playerOut')
            .enableExtractProperty('time');

        hydrator.enableHydrateProperty('playerIn')
            .enableHydrateProperty('playerOut')
            .enableHydrateProperty('time');

        this.serviceManager.get('HydratorPluginManager').set(
            'replacementSoccerHydrator',
            hydrator
        );
    }
}

module.exports = SoccerConfig;