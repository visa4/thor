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

        let timeslotSenderService = new TimeslotSenderService();
        this.serviceManager.set('TimeslotSenderService', timeslotSenderService);

        let timeslotService = new TimeslotService(
            this.serviceManager.get('TimeslotSenderService'),
            this.serviceManager.get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
        );

        timeslotService.startSchedule();

        this.serviceManager.set('TimeslotService', timeslotService);
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
            .enableHydrateProperty('status')
            .enableHydrateProperty('loop')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('context')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('resources');

        timeslotHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('loop')
            .enableExtractProperty('currentTime')
            .enableExtractProperty('duration')
            .enableExtractProperty('context')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('resources');

        this.serviceManager.get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }
}

module.exports = TimeslotConfig;