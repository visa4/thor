global.VIRTUAL_MONITOR_NAME_SERVICE = 'virtual-monitor.service';
global.VIRTUAL_MONITOR_NAME_STORAGE = 'virtual-monitor.data';

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

        this.serviceManager.get('LocalStoragePluginManager').set(
            MonitorConfig.NAME_SERVICE,
            new LocalStorage(
                MonitorConfig.NAME_STORAGE,
                this.serviceManager.get('HydratorPluginManager').get('virtualMonitorHydrator'),
            )
        );
    }

    _loadHydrator() {
        let virtualMonitorHydrator = new PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' :  new HydratorStrategy(new PropertyHydrator(new Monitor()))
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