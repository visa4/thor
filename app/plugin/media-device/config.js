/**
 *
 */
class MediaDeviceConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'media-device.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'media-device.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'media-device'; };

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

    }

    _loadDataServiceInjectorService() {
        let timeslotDataInjectorServicePluginManager = new TimeslotDataInjectorServicePluginManager();
        this.serviceManager.set('TimeslotDataInjectorService', timeslotDataInjectorServicePluginManager);

        this.serviceManager.get('TimeslotDataInjectorService').set('Test1',new Test1());
        this.serviceManager.get('TimeslotDataInjectorService').set('Test2',new Test2());
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
                                    MediaDeviceConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                MediaDeviceConfig.NAME_SERVICE,
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