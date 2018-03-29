
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

        let playlistLocalStorage = new LocalStorage(
            PlaylistConfig.NAME_STORAGE,
            this.serviceManager.get('HydratorPluginManager').get('playlistHydrator')
        );

        this.serviceManager.get('LocalStoragePluginManager').set(
            PlaylistConfig.NAME_SERVICE,
            playlistLocalStorage
        );
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
            .enableExtractProperty('status')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('timeslots');

        this.serviceManager.get('HydratorPluginManager').set(
            'playlistHydrator',
            hydrator
        );
    }
}

module.exports = PlaylistConfig;