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

    init() {

        this._loadHydrator();

        let storage = new Storage(
            new IndexedDbStorage('Dsign', 'virtualMonitor'),
            this.serviceManager.get('HydratorPluginManager').get('virtualMonitorHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            MonitorConfig.NAME_SERVICE,
            storage
        );
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
}

module.exports = MonitorConfig;