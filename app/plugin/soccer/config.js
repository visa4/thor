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

        let hydrator = new PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new NumberStrategy(),
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('surname')
            .enableExtractProperty('shirtName')
            .enableExtractProperty('shirtNumber')
            .enableExtractProperty('position')
            .enableExtractProperty('nationality')
            .enableExtractProperty('goals');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('surname')
            .enableHydrateProperty('shirtName')
            .enableHydrateProperty('shirtNumber')
            .enableHydrateProperty('position')
            .enableHydrateProperty('nationality')
            .enableHydrateProperty('goals');

        this.serviceManager.get('HydratorPluginManager').set(
            'playerSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new TeamSoccer(),
            {
                shirtNumber: new NumberStrategy(),
            }
        );



        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('logo')
            .enableExtractProperty('players')
            .enableExtractProperty('staff');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('logo')
            .enableHydrateProperty('players')
            .enableHydrateProperty('staff');

        this.serviceManager.get('HydratorPluginManager').set(
            'teamSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new MatchSoccer(),
            {

            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('date')
            .enableExtractProperty('teams');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('place')
            .enableHydrateProperty('date')
            .enableHydrateProperty('teams');

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
                                "++id", "place", "date", "teams"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let storage = new Storage(
                                new DexieCollection(
                                    serviceManager.get('DexieManager'),
                                    SoccerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('matchSoccerHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SoccerConfig.NAME_SERVICE,
                                storage
                            );

                        }.bind(this)
                    );
                }
            }
        );
    }
}

module.exports = SoccerConfig;