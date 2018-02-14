const RESORURCE_NAME_SERVICE = 'resoruce.service';
const RESOURCE_NAME_STORAGE = 'resoruce.data';

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


let hydrator = new AggregatePropertyHydrator('type');
hydrator.addHydratorMap(imageHydrator, ['image/jpeg', 'image/png']);
hydrator.addHydratorMap(videoHydrator, ['video/mp4']);

let resourceLocalStorage = new LocalStorage(RESOURCE_NAME_STORAGE, hydrator);

/**
 *
 */
resourceLocalStorage.eventManager.on(
    LocalStorage.LOCAL_STORAGE_REMOVE_EVT,
    (evt) => {
        fs = require('fs');
        fs.unlink(evt.data.getPath(), function (err) {
            if (err) {
                throw err;
            }
        })
    }
);

/**
 *
 */
resourceLocalStorage.eventManager.on(
    LocalStorage.LOCAL_STORAGE_SAVE_EVT,
    // TODO capire perchè la notazione => non prende il bind
    function(evt) {
        fs = require('fs');
        path = require('path');

        let arrayName = path.win32.basename(evt.data.getPath()).split('.');
        let pathName = `${__dirname}/storage/resource/`;
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
            this.update(evt.data);
        }.bind(this));

    }.bind(resourceLocalStorage)
);


manager = LocalStorageManager.getInstance();
manager.set(
    RESORURCE_NAME_SERVICE,
    resourceLocalStorage
);