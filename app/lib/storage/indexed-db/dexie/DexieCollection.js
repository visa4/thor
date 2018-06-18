try {
    Pagination = require('./../../../pagination/Pagination');
}
catch (err) {

    Pagination = require(__dirname + '/lib/pagination/Pagination');
}

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
    getAll(page = 1, itemCount = 10, search) {

        let promise = new Promise((resolve, reject) => {

            let computePage = page > 0 ? page - 1 : page;
            let collection = new Pagination([], page, itemCount);

            // TODO SEARCH

            this.dexieManager
                .db[this.nameCollection]
                .toCollection()
                .count()
                .then(
                    function (data) {

                        let totalItem = data;
                        this.dexieManager
                            .db[this.nameCollection]
                            .toCollection()
                            .offset(computePage * itemCount)
                            .limit(itemCount)
                            .toArray().then(
                                function (data) {

                                    let collection = new Pagination(data, page, itemCount, totalItem);
                                    resolve(collection);
                                }
                            ).catch(error => { reject(error) } );

                    }.bind(this)
                ).catch(error => { reject(error) } );
        });

        return promise;
    }

    /**
     * @param search
     * @return {Dexie.Promise<number> | Dexie.Promise<any>}
     */
    count(search) {
        return this.dexieManager
            .db[this.nameCollection]
            .toCollection()
            .count();
    }
}

module.exports = DexieCollection;