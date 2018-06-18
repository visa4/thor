
class DexieCollection {

    /**
     * @param dexieManager
     * @param nameCollection
     */
    constructor(dexieManager, nameCollection) {

        /**
         * @type {DexieManager}
         */
        this.dexieManager = dexieManager;

        /**
         * @type {String}
         */
        this.nameCollection = nameCollection;
    }

    /**
     * @param {Object} obj
     */
    save(obj) {
        return this.dexieManager.db[this.nameCollection].add(obj);
    }

    /**
     *
     * @param {Object} obj
     */
    update (obj) {
        return this.dexieManager.db[this.nameCollection].put(obj);
    }

    /**
     * @param {Object} obj
     */
    remove(obj) {
        return this.dexieManager.db[this.nameCollection].delete(obj.id);
    }


    /**
     * @param {String} id
     */
    get(id) {
        return this.dexieManager.db[this.nameCollection].get(obj.id);
    }

    /**
     * @param page
     * @param itemCount
     * @param search
     * @return {Dexie.Promise<Array<T>> | Dexie.Promise<any>}
     */
    getAll(page = 0, itemCount = 10, search) {
        return this.dexieManager.db[this.nameCollection].toCollection().toArray();
    }
}

module.exports = DexieCollection;