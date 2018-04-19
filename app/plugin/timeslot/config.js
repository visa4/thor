/**
 *
 */
class TimeslotConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'timeslot.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'timeslot.data'; };

    init() {

        this._loadHydrator();

        let storage = new Storage(
            new IndexedDbStorage('Dsign', 'timeslot'),
            this.serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            TimeslotConfig.NAME_SERVICE,
            storage
        );

        this.serviceManager.set('TimeslotService', new TimeslotService(
            this.serviceManager.get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE)
        ));
    }

    _loadHydrator() {
        let timeslotHydrator = new PropertyHydrator(
            new Timeslot(),
            {
                'resources' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('resourceHydrator')),
                'virtualMonitorReference' : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference()))
            }
        );

        timeslotHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('resources');

        timeslotHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('duration')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('resources');

        this.serviceManager.get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }
}

module.exports = TimeslotConfig;