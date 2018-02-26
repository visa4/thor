global.RESOURCE_NAME_SERVICE = 'resource.service';
global.RESOURCE_NAME_STORAGE = 'resource.data';

/**
 *
 */
class ResourceConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'resource.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'resource.data'; };

    /**
     *
     */
    init() {
        this._loadHydrator();

        let resourceLocalStorage = new LocalStorage(
            ResourceConfig.NAME_STORAGE,
            this.serviceManager.get('HydratorPluginManager').get('resourceHydrator')
        );

        resourceLocalStorage.eventManager.on(
            LocalStorage.LOCAL_STORAGE_REMOVE_EVT,
            this.onRemove.bind(resourceLocalStorage)
        );

        resourceLocalStorage.eventManager.on(
            LocalStorage.LOCAL_STORAGE_SAVE_EVT,
            this.onSave.bind(resourceLocalStorage)
        );

        resourceLocalStorage.eventManager.on(
            LocalStorage.LOCAL_STORAGE_UPDATE_EVT,
            this.onUpdate.bind(resourceLocalStorage)
        );

        this.serviceManager.get('LocalStoragePluginManager').set(
            ResourceConfig.NAME_SERVICE,
            resourceLocalStorage
        );

    }

    /**
     *
     * @return {AggregatePropertyHydrator}
     * @private
     */
    _loadHydrator() {

        this._loadVideoHydrator();
        this._loadImageHydrator();
        this._loadZipHydrator();

        let hydrator = new AggregatePropertyHydrator('type');
        hydrator.addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('imageHydrator'),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('videoHydrator'),
            ['video/mp4']
        ).addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('genericHydrator'),
            ['application/zip']
        );

        this.serviceManager.get('HydratorPluginManager').set(
            'resourceHydrator',
            hydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadVideoHydrator() {
        let videoHydrator = new PropertyHydrator(new Video());
        videoHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('customName')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration');

        videoHydrator.enableExtractProperty('id')
            .enableExtractProperty('customName')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension');

        this.serviceManager.get('HydratorPluginManager').set(
            'videoHydrator',
            videoHydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadImageHydrator() {
        let imageHydrator = new PropertyHydrator(new Image());
        imageHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('customName')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension');

        imageHydrator.enableExtractProperty('id')
            .enableExtractProperty('customName')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension');

        this.serviceManager.get('HydratorPluginManager').set(
            'imageHydrator',
            imageHydrator
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _loadZipHydrator() {
        let genericHydrator = new PropertyHydrator(new GenericFile());

        genericHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('customName')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified');

        genericHydrator.enableExtractProperty('id')
            .enableExtractProperty('customName')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified');

        this.serviceManager.get('HydratorPluginManager').set(
            'genericHydrator',
            genericHydrator
        );
    }

    /**
     * @param evt
     */
    onRemove(evt) {
        let fs = require('fs');
        fs.unlink(evt.data.getPath(), function (err) {
            if (err) {
                throw err;
            }
        })
    }

    /**
     * @param evt
     */
    onSave(evt) {
        let fs = require('fs');
        let path = require('path');

        let arrayName = path.win32.basename(evt.data.getPath()).split('.');
        let pathName = `${__dirname}/../../storage/resource/`;
        let fileName = `${evt.data.id}.${arrayName[1]}`;
        let url = `${pathName}${fileName}`;

        fs.rename(evt.data.getPath(), url , function (err) {
            if (err) {
                throw err;
            }

            evt.data.location = {
                path: pathName,
                name: fileName
            };

            if (evt.data.type === "application/zip") {
                let unzip= require('unzip');
                fs.createReadStream(evt.data.getPath()).pipe(unzip.Extract({ path: `${pathName}${evt.data.id}` }));
                evt.data.location.name = evt.data.id + '/index.html';
            }

            this.update(evt.data);
        }.bind(this));
    }

    /**
     *
     * @param evt
     */
    onUpdate(evt) {
        let fs = require('fs');
        let path = require('path');

        let arrayName = path.win32.basename(evt.data.getPath()).split('.');
        if (arrayName[0] !== 'resource') {
            // Break because the resource is already move
            return;
        }

        let pathName = `${__dirname}/../../storage/resource/`;
        let fileName = `${evt.data.id}.${arrayName[1]}`;
        let url = `${pathName}${fileName}`;

        fs.readdir(pathName, (error, files) => {
            if (error) throw error;

            files.filter(nameFile => nameFile.indexOf(evt.data.id) >= 0).forEach(fileToRemove => {
                fs.unlink(pathName + fileToRemove, function (err) {
                    if (err) {
                        throw err;
                    }
                })
            });
        });

        fs.rename(evt.data.getPath(), url , function (err) {
            if (err) {
                throw err;
            }

            evt.data.location = {
                path: pathName,
                name: fileName
            };

            if (evt.data.type === "application/zip") {
                let unzip= require('unzip');
                fs.createReadStream(evt.data.getPath()).pipe(unzip.Extract({ path: `${pathName}${evt.data.id}` }));
                evt.data.location.name = evt.data.id + '/index.html';
            }

            this.update(evt.data);
        }.bind(this));
    }
}

module.exports = ResourceConfig;