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
                    case service[cont] === 'TimeslotSenderService':
                        this._loadTimeslotServerService();
                        break;
                    case service[cont] === 'TimeslotService':
                        this._loadTimeslotService();
                        break;
                    case service[cont] === 'TimeslotDataInjectorService':
                        this._loadDataServiceInjectorService();
                        break;
                }
            }
        }

    }

    /**
     * @private
     */
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
        let timeslotDataInjectorServicePluginManager = new TimeslotDataInjectorServicePluginManager();
        this.serviceManager.set('TimeslotDataInjectorService', timeslotDataInjectorServicePluginManager);

        this.serviceManager.get('TimeslotDataInjectorService').set('Test1',new Test1());
        this.serviceManager.get('TimeslotDataInjectorService').set('Test2',new Test2());
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

    /**
     * @private
     */
    _loadStorage() {

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        let indexDbAdapter =  new IndexedDbStorage(indexedDBConfig.name, TimeslotConfig.NAME_COLLECTION);

        // TODO PORCATA DA SISTEMARE
        setTimeout(
            function () {
                //indexDbAdapter.createIndex({indexName: 'name', keyPath : 'name', parameters : {unique: false}});
                //indexDbAdapter.createIndex({indexName: 'status', keyPath : 'status', parameters : {unique: false}});
            }.bind(this),
            2000
        );

        let storage = new Storage(
            indexDbAdapter,
            this.serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            TimeslotConfig.NAME_SERVICE,
            storage
        );
    }
}

module.exports = TimeslotConfig;