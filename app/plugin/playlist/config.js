/**
 *
 */
class PlaylistConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'playlist.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'playlist.data'; };

    /**
     *
     */
    init() {
        this._loadHydrator();

        let storage = new Storage(
            new IndexedDbStorage('Dsign', 'playlist'),
            this.serviceManager.get('HydratorPluginManager').get('playlistHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            PlaylistConfig.NAME_SERVICE,
            storage
        );

        let playlistService =  new PlaylistService(
            this.serviceManager.get('TimeslotSenderService'),
            this.serviceManager.get('StoragePluginManager').get(PlaylistConfig.NAME_SERVICE),
            this.serviceManager.get('Timer')
        );

        this.serviceManager.set('PlaylistService', playlistService);
    }

    /**
     *
     * @return {AggregatePropertyHydrator}
     * @private
     */
    _loadHydrator() {

        let hydrator = new PropertyHydrator(
            new Playlist(),
            {
                'timeslots' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('timeslotHydrator'))
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('context')
            .enableExtractProperty('loop')
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('status')
            .enableExtractProperty('binds')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('loop')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('timeslots');

        this.serviceManager.get('HydratorPluginManager').set(
            'playlistHydrator',
            hydrator
        );
    }
}

module.exports = PlaylistConfig;