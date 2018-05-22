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

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'timeslot'; };

    init() {

        this._loadHydrator();

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        let storage = new Storage(
            new IndexedDbStorage(indexedDBConfig.name, TimeslotConfig.NAME_COLLECTION),
            this.serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            TimeslotConfig.NAME_SERVICE,
            storage
        );

        this._loadTimeslotServerService();
        this._loadTimeslotService();
        this._loadDataServiceInjectorService();
    }

    _loadHydrator() {
        let timeslotHydrator = new PropertyHydrator(
            new Timeslot(),
            {
                'resources' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('resourceHydrator')),
                'virtualMonitorReference' : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
                'dataReferences' : new HydratorStrategy(new PropertyHydrator(new TimeslotDataReference())),
            }
        );

        timeslotHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('loop')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('context')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('dataReferences');

        timeslotHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('loop')
            .enableExtractProperty('binds')
            .enableExtractProperty('currentTime')
            .enableExtractProperty('duration')
            .enableExtractProperty('context')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('resources')
            .enableExtractProperty('dataReferences');

        this.serviceManager.get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }

    _loadDataServiceInjectorService() {
        let timeslotDataInjectorService = new TimeslotDataInjectorService();
        this.serviceManager.set('TimeslotDataInjectorService', timeslotDataInjectorService);

        this.serviceManager.get('TimeslotDataInjectorService').timeslotDataServicePluginManager.set('Test1',new Test1())
        this.serviceManager.get('TimeslotDataInjectorService').timeslotDataServicePluginManager.set('Test2',new Test2())
    }

    /**
     * @private
     */
    _loadTimeslotServerService() {
        let timeslotSenderService = new TimeslotSenderService();
        this.serviceManager.set('TimeslotSenderService', timeslotSenderService);
    }

    /**
     * @private
     */
    _loadTimeslotService() {

        let timeslotService = new TimeslotService(
            this.serviceManager.get('TimeslotSenderService'),
            this.serviceManager.get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
            this.serviceManager.get('Timer')
        );

        this.serviceManager.set('TimeslotService', timeslotService);
    }
}

module.exports = TimeslotConfig;