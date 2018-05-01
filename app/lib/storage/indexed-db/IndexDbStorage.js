/**
 *
 */
class IndexedDbStorage {

    /**
     * @param indexedDB
     */
    setConnection(indexedDB) {
        let nameDb = 'db' + this.dbName.charAt(0).toUpperCase() +  this.dbName.slice(1);
        window[nameDb] = indexedDB;
    }

    getConnection() {
        let nameDb = 'db' + this.dbName.charAt(0).toUpperCase() +  this.dbName.slice(1);
        return window[nameDb] ? window[nameDb] : null;
    }

    /**
     *
     * @param dbName
     * @param collectionName
     */
    constructor (dbName, collectionName) {

        if (!('indexedDB' in window)) {
            console.error('This browser doesn\'t support IndexedDB');
            return;
        }

        if (typeof collectionName !== 'string' || collectionName.length === 0) {
            console.error('the collaction name must be a string not empty');
            return;
        }

        this.collectionName = collectionName;
        this.dbName = dbName;


        /**
         * Open connection DB
         */
        let request = indexedDB.open(dbName);

        /**
         * @param evt
         */
        request.onerror = (evt) => {
            console.error(evt);
        };

        /**
         * @param evt
         */
        request.onupgradeneeded = (evt) => {
            this.setConnection(evt.target.result);
            this.getConnection().createObjectStore(this.collectionName, { keyPath: "id" });
        };

        /**
         * @param evt
         */
        request.onsuccess = (evt) => {
            this.setConnection(evt.target.result);
            if (!this.getConnection().objectStoreNames.contains(this.collectionName)) {

                this.getConnection().close();
                let request = indexedDB.open(dbName, this._getUpgradedVersion());
                console.log('updrade');
                request.onupgradeneeded = (evt) => {
                    this.setConnection(evt.target.result);
                    this.getConnection().createObjectStore(this.collectionName, { keyPath: "id" });
                };

                request.onsuccess = (evt) => {
                    this.setConnection(evt.target.result);
                };

                request.onerror = this._dbError;
            }
        }
    }

    /**
     * @param obj
     * @return {Promise}
     */
    save (obj) {

        let promise = new Promise((resolve, reject) => {

            try {
                let request = this.getConnection().transaction([this.collectionName], "readwrite")
                    .objectStore(this.collectionName)
                    .add(obj);

                /**
                 * @param evt
                 */
                request.onerror = (evt) => {
                    reject({error : evt.target.error, type: 'save'});
                };

                /**
                 * @param event
                 */
                request.onsuccess = (evt) => {
                    resolve(obj);
                };
            } catch (err) {
                reject({error : err, type: 'save'});
            }
        });

        return promise;
    }

    /**
     * @return {Promise}
     */
    update (obj) {

        let promise = new Promise((resolve, reject) => {

            try {
                let request = this.getConnection().transaction([this.collectionName], "readwrite")
                    .objectStore(this.collectionName)
                    .put(obj);

                /**
                 * @param evt
                 */
                request.onerror = (evt) => {
                    reject({error : evt.target.error, type: 'put'});
                };

                /**
                 * @param event
                 */
                request.onsuccess = (evt) => {
                    resolve(obj);
                };
            } catch (err) {
                reject({error : err, type: 'put'});
            }
        });

        return promise;
    }

    /**
     * @param obj
     * @return {Promise}
     */
    remove(obj) {
        let promise = new Promise((resolve, reject) => {

            try {
                let request = this.getConnection().transaction([this.collectionName], "readwrite")
                    .objectStore(this.collectionName)
                    .delete(obj.id);

                /**
                 * @param evt
                 */
                request.onerror = (evt) => {
                    reject({error : evt.target.error, type: 'remove'});
                };

                /**
                 * @param evt
                 */
                request.onsuccess = (evt) => {
                    resolve(obj);
                };
            } catch (err) {
                reject({error : err, type: 'remove'});
            }
        });

        return promise;
    }

    /**
     * @param id
     * @return {Promise}
     */
    get(id) {
        let promise = new Promise((resolve, reject) => {

            try {
                let request = this.getConnection().transaction([this.collectionName], "readonly")
                    .objectStore(this.collectionName)
                    .get(id);

                /**
                 * @param evt
                 */
                request.onerror = (evt) => {
                    reject({error : evt.target.error, type: 'get'});
                };

                /**
                 * @param event
                 */
                request.onsuccess = (evt) => {
                    resolve(evt.target.result);
                };
            } catch (err) {
                reject({error : err, type: 'get'});
            }
        });

        return promise;
    }

    /**
     *
     * @param page
     * @param itemCount
     * @param search
     * @return {Promise}
     */
    getAll(page, itemCount, search) {

        let currentPage = page;
        let currentItemCount = itemCount;

        let promise = new Promise((resolve, reject) => {

            try {

                let request = this.getConnection().transaction([this.collectionName], "readonly")
                    .objectStore(this.collectionName)
                    .openCursor();

                /**
                 * @param evt
                 */
                request.onerror = (evt) => {
                    reject({error : evt.target.error, type: 'getAll'});
                };

                let data =  [];
                let start = (currentPage -1) * currentItemCount;
                let firstCicle = true;
                let countItem = 0;
                /**
                 * @param event
                 */
                request.onsuccess = (evt) => {
                    let cursor = evt.target.result;
                    if (cursor) {

                        switch (true) {

                            case firstCicle === true && start > 0:
                                cursor.advance(start);
                                firstCicle = false;
                                break;
                            case countItem < currentItemCount:
                                data.push(cursor.value);
                                cursor.continue();
                                countItem++;
                                break;
                            case countItem === currentItemCount:
                                resolve(data);
                                break;
                            default:
                                if (firstCicle === true && !!cursor.value) {
                                    data.push(cursor.value);
                                }
                                resolve(data);
                        }
                    } else {
                        resolve(data);
                    }
                };
            } catch (err) {
                reject({error : err, type: 'getAll'});
            }
        });

        return promise;
    }

    _dropObjectStorage() {

        this.getConnection().close();
        let request = indexedDB.open(this.dbName, this._getUpgradedVersion());

        /**
         * @param evt
         */
        request.onerror = this._dbError;

        /**
         * @param evt
         */
        request.onupgradeneeded = (evt) => {
            console.log('remove storage');
            this.setConnection(evt.target.result);
            if (this.getConnection().objectStoreNames.contains(this.collectionName)) {
                this.getConnection() .deleteObjectStore(this.collectionName);
            }
        };
    }

    /**
     * @return {*}
     * @private
     */
    _getUpgradedVersion() {
        return this.getConnection().version + 1;
    }

    /**
     *
     * @param evt
     * @private
     */
    _dbError(evt) {
        console.error('Error',evt);
    }
}

module.exports = IndexedDbStorage;
