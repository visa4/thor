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
 * @type {StoragePluginManager}
 */
const storagePluginManager = new StoragePluginManager();

serviceManager.set(
    hydratorPluginManager.constructor.name,
    hydratorPluginManager
).set(
    storagePluginManager.constructor.name,
    storagePluginManager
).set(
    'PaperToastNotification',
    new PaperToastNotification('notification')
);