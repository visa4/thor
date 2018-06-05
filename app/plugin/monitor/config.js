/**
 *
 */
class MonitorConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'virtual-monitor.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'virtual-monitor.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'virtualMonitor'; };


    init() {

        this._loadHydrator();
        this._loadStorage();
    }

    _loadHydrator() {
        let virtualMonitorHydrator = new PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' :  new HydratorStrategy(
                    new PropertyHydrator(
                        new Monitor(),
                        { 'monitors' :  new HydratorStrategy(new PropertyHydrator(new Monitor())) }
                    )
                )
            }
        );

        virtualMonitorHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('enable')
            .enableExtractProperty('monitors');

        virtualMonitorHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('monitors');

        this.serviceManager.get('HydratorPluginManager').set(
            'virtualMonitorHydrator',
             virtualMonitorHydrator
        );
    }

    _loadStorage() {
        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        /*
        let storageAdapter = new DexieStorage(
            indexedDBConfig.name,
            MonitorConfig.NAME_COLLECTION,
            ['name', 'status'],
            420
        );
        */

        let storage = new Storage(
            new IndexedDbStorage(indexedDBConfig.name, MonitorConfig.NAME_COLLECTION),
            this.serviceManager.get('HydratorPluginManager').get('virtualMonitorHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            MonitorConfig.NAME_SERVICE,
            storage
        );
    }
}

module.exports = MonitorConfig;