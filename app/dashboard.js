/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
/**
 * Global hydrator plugin manager
 *
 * @type {HydratorPluginManager}
 */
const hydratorPluginManager = new HydratorPluginManager();
/**
 * Global local storage plugin manager
 *
 * @type {LocalStoragePluginManager}
 */
const locatStoragePluginManager = new LocalStoragePluginManager();

serviceManager.set(
    hydratorPluginManager.constructor.name,
    hydratorPluginManager
).set(
    locatStoragePluginManager.constructor.name,
    locatStoragePluginManager
).set(
    'PaperToastNotification',
    new PaperToastNotification('notification')
);