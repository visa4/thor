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
            this.serviceManager.get('LocalStoragePluginManager').get(MonitorConfig.NAME_SERVICE)
        ));
    }

    _loadHydrator() {
        let timeslotHydrator = new PropertyHydrator(
            new Timeslot(),
            {
                'monitor' : new HydratorStrategy(new PropertyHydrator(new Monitor())),
                'resources' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('resourceHydrator'))
            }
        );

        timeslotHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('monitor')
            .enableHydrateProperty('resources');

        timeslotHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('duration')
            .enableExtractProperty('monitor')
            .enableExtractProperty('resources');

        this.serviceManager.get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }
}

module.exports = TimeslotConfig;