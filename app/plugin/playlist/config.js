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
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'playlist'; };


    /**
     *
     */
    init(service = []) {
        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
            this._loadPlaylistService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'PlaylistService':
                        this._loadPlaylistService();
                        break;
                }
            }
        }

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

    /**
     * @private
     */
    _loadStorage() {

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        let storageAapter = new DexieStorage(
            indexedDBConfig.name + '_test',
            PlaylistConfig.NAME_COLLECTION,
            ['name', 'status'],
            1
        );


        let storage = new Storage(
            storageAapter,
            this.serviceManager.get('HydratorPluginManager').get('playlistHydrator')
        );

        this.serviceManager.get('StoragePluginManager').set(
            PlaylistConfig.NAME_SERVICE,
            storage
        );
    }

    /**
     * @private
     */
    _loadPlaylistService() {
        let playlistService =  new PlaylistService(
            this.serviceManager.get('TimeslotSenderService'),
            this.serviceManager.get('StoragePluginManager').get(PlaylistConfig.NAME_SERVICE),
            this.serviceManager.get('Timer')
        );
        this.serviceManager.set('PlaylistService', playlistService);
    }
}

module.exports = PlaylistConfig;