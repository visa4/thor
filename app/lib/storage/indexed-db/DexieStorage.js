const Dexie = require('dexie');

class DexieStorage {

    /**
     * @param name
     * @return {Dexie|*}
     */
    static getDb(name) {
        if (!this.db) {
            this.db = new Dexie(name);
        }
        return this.db;
    }

    constructor (dbName, nameCollection, indexes = [], version = 1) {
        this.db = DexieStorage.getDb(dbName);
        this.nameCollection = nameCollection;
        let optionStores = {};
        optionStores[this.nameCollection] = this._createIndex(indexes);
        // create object store
        this.db.version(version).stores(optionStores)
    }

    _createIndex(indexes = []) {
        indexes.unshift('id');
        return indexes.join(',');
    }

    /**
     * @param {Object} obj
     */
    save(obj) {
        return this.db[this.nameCollection].add(obj);
    }

    /**
     *
     * @param {Object} obj
     */
    update (obj) {
        return this.db[this.nameCollection].put(obj);
    }

    /**
     * @param {Object} obj
     */
    remove(obj) {
        return this.db[this.nameCollection].remove(obj.id);
    }


    /**
     * @param {String} id
     */
    get(id) {
        return this.db[this.nameCollection].get(obj.id);
    }

    getAll(page = 0, itemCount = 10, search) {
        return this.db[this.nameCollection].toCollection().toArray();
    }
}


module.exports = DexieStorage;