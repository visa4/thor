/**
 *
 */
class TimerConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'timer.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'timer.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'timer'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
            this._loadTimeslotServerService();
            this._loadTimeslotService();
            this._loadDataServiceInjectorService();
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
                            "name": MediaDeviceConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "status", "duration", "virtualMonitorReference", "*tags"
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
                                    TimerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                TimerConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }
        );
    }
}

module.exports = TimeslotConfig;