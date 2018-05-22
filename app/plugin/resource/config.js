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
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'resource'; };

    /**
     *
     */
    init() {
        this._loadHydrator();

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        let storage = new Storage(
            new IndexedDbStorage(indexedDBConfig.name, ResourceConfig.NAME_COLLECTION),
            this.serviceManager.get('HydratorPluginManager').get('resourceHydrator')
        );

        storage.eventManager.on(
            Storage.STORAGE_POST_SAVE,
            this.onSave.bind(storage)
        );

        storage.eventManager.on(
            Storage.STORAGE_POST_UPDATE,
            this.onUpdate.bind(storage)
        );

        storage.eventManager.on(
            Storage.STORAGE_POST_REMOVE,
            this.onRemove.bind(storage)
        );

        this.serviceManager.get('StoragePluginManager').set(
            ResourceConfig.NAME_SERVICE,
            storage
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
            ['application/zip', 'text/html']
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
            .enableHydrateProperty('wcName')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified');

        genericHydrator.enableExtractProperty('id')
            .enableExtractProperty('customName')
            .enableExtractProperty('size')
            .enableExtractProperty('wcName')
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

        if (evt.data.type == 'text/html') {
            Utils.removeDir(evt.data.location.path + evt.data.id);
        } else {
            fs.unlink(evt.data.getPath(), function (err) {
                if (err) {
                    throw err;
                }
            })
        }
    }

    /**
     * @param evt
     */
    onSave(evt) {
        let fs = require('fs');
        let path = require('path');

        // TODO accept only domain object
        evt.data.getPath = function () {
            return this.location.path + this.location.name;
        }.bind(evt.data);

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
                let AdmZip = require('adm-zip');
                let fs = require('fs');

                let zip =  new AdmZip(evt.data.getPath());
                zip.extractAllTo(`${pathName}${evt.data.id}`, true);
                Utils.move(evt.data.getPath(), `${evt.data.location.path}${evt.data.id}/${evt.data.location.name}`);

                if (fs.existsSync(`${pathName}${evt.data.id}/package.json`)) {
                    let wcConfig = JSON.parse(
                        fs.readFileSync(`${pathName}${evt.data.id}/package.json`).toString()
                    );

                    evt.data.location.name = `${evt.data.id}/${wcConfig.main}`;
                    evt.data.type = 'text/html';
                    evt.data.wcName = wcConfig.name;
                }
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

        // TODO accept only domain object
        evt.data.getPath = function () {
            return this.location.path + this.location.name;
        }.bind(evt.data);

        let arrayName = path.win32.basename(evt.data.getPath()).split('.');
        if (arrayName[0] !== 'resource') {
            // Break because the resource is already move
            return;
        }

        let pathName = `${__dirname}/../../storage/resource/`;
        let filePath = `${__dirname}/../../storage/resource/${evt.data.id}`;
        let fileName = `${evt.data.id}.${arrayName[1]}`;
        let url = `${pathName}${fileName}`;

        fs.lstat(filePath, (err, stats) => {

            if(err) {
                console.log(err);
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
                return;
            }

            if (stats.isDirectory()) {
                Utils.removeDir(filePath);
            }
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
                let AdmZip = require('adm-zip');
                let fs = require('fs');

                let zip =  new AdmZip(evt.data.getPath());
                zip.extractAllTo(`${pathName}${evt.data.id}`, true);
                Utils.move(evt.data.getPath(), `${evt.data.location.path}${evt.data.id}/${evt.data.location.name}`);

                if (fs.existsSync(`${pathName}${evt.data.id}/package.json`)) {
                    let wcConfig = JSON.parse(
                        fs.readFileSync(`${pathName}${evt.data.id}/package.json`).toString()
                    );

                    evt.data.location.name = `${evt.data.id}/${wcConfig.main}`;
                    evt.data.type = 'text/html';
                    evt.data.wcName = wcConfig.name;
                }
            }

            this.update(evt.data);
        }.bind(this));
    }
}

module.exports = ResourceConfig;