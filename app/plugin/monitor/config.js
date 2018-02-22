global.VIRTUAL_MONITOR_NAME_SERVICE = 'virtual-monitor.service';
global.VIRTUAL_MONITOR_NAME_STORAGE = 'virtual-monitor.data';

/**
 *
 */
class MonitorConfig {

    init() {

        this._loadHydrator();

        let manager = LocalStoragePluginManager.getInstance();
        manager.set(
            VIRTUAL_MONITOR_NAME_SERVICE,
            new LocalStorage(
                VIRTUAL_MONITOR_NAME_STORAGE,
                HydratorPluginManager.getInstance().get('virtualMonitorHydrator'),
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

        HydratorPluginManager.getInstance().set(
            'virtualMonitorHydrator',
            virtualMonitorHydrator
        );
    }
}

module.exports = MonitorConfig;