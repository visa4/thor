const CONFIGURATION_NAME_SERVICE = 'configuration.service';
const CONFIGURATION_NAME_STORAGE = 'configuration.data';

let manager = LocalStorageManager.getInstance();
manager.set(
    CONFIGURATION_NAME_SERVICE,
    new LocalStorage(CONFIGURATION_NAME_STORAGE, new PropertyHydrator(new Configuration()))
);