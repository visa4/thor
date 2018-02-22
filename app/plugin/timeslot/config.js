global.TIMESLOT_NAME_SERVICE = 'timeslot.service';
global.TIMESLOT_NAME_STORAGE = 'timeslot.data';

/**
 *
 */
class TimeslotConfig {

    init() {

        this._loadHydrator();

        let manager = LocalStoragePluginManager.getInstance();
        manager.set(
            TIMESLOT_NAME_SERVICE,
            new LocalStorage(
                TIMESLOT_NAME_STORAGE,
                HydratorPluginManager.getInstance().get('timeslotHydrator')
            )
        );
    }

    _loadHydrator() {
        let timeslotHydrator = new PropertyHydrator(
            new Timeslot(),
            {
                'monitor' : new HydratorStrategy(new PropertyHydrator(new Monitor())),
                'resources' : new HydratorStrategy(HydratorPluginManager.getInstance().get('resourceHydrator'))
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

        HydratorPluginManager.getInstance().set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }
}

module.exports = TimeslotConfig;