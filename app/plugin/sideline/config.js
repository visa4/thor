/**
 *
 */
class SidelineConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'sideline.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'sideline.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'sideline'; };

    /**
     *
     */
    init() {
        this._loadHydrator();
        this._loadStorage();
        this._loadSidelineResourceGenerator();
    }

    _loadStorage() {
        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
                        {
                            "name": SidelineConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "height", "width"
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
                                    SidelineConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('sidelineHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SidelineConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }.bind(this)
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadHydrator() {
        let sidelineHydrator = new PropertyHydrator(
            new Sideline(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy()
            }
        );

        sidelineHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height');

        sidelineHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height');

        this.serviceManager.get('HydratorPluginManager').set(
            'sidelineHydrator',
            sidelineHydrator
        );
    }

    _loadSidelineResourceGenerator() {

        this.serviceManager.set(
            'SidelineResourceGenerator',
            new SidelineResourceGenerator()
        );
    }
}

module.exports = SidelineConfig;