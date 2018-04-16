/**
 *
 */
class LocalStorage {

    constructor(dbName, collectionName) {

        this.dbName = dbName;
        this.collectionName = collectionName;
        this.data = localStorage.getItem(this.namespace) ? JSON.parse(localStorage.getItem(this.namespace)) : [];
    }

    /**
     * @return {string}
     * @private
     */
    _getNamespace() {
        return this.dbName + '.' + this.collectionName;
    }

    /**
     *
     * @param obj
     * @return {Promise}
     */
    save(obj) {

        return new Promise((resolve, reject) => {

            this.data.push(obj);
            this._persist();
            resolve(obj);
        });
    }

    /**
     *
     * @param obj
     * @return {Promise}
     */
    update(obj) {

        return new Promise((resolve, reject) => {

            let index = this._find(obj.id);

            if (index >= 0) {
                this.data[index] = obj
                this._persist();
            }

            resolve(obj);
        });
    }


    /**
     *
     * @param obj
     * @return {Promise}
     */
    remove(obj) {

        return new Promise((resolve, reject) => {

            let index = this._find(obj.id);

            if (index >= 0) {
                this.data.splice(index, 1);
                this._persist();
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    /**
     *
     */
    getAll() {
        throw 'Implement';
    }

    /**
     *
     * @param id
     * @return {Promise}
     */
    get(id) {

        return new Promise((resolve, reject) => {

            let index = this._find(id);

            if (index >= 0) {
                resolve(this.data[find]);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @private
     */
    _persist() {
        localStorage.setItem(this._getNamespace(), JSON.stringify(this.data));
    }

    /**
     * @param id string
     * @returns {number}
     * @private
     */
    _find (id) {
        return this.data.findIndex(
            function (element) {
                if (element.id === id) {
                    return true;
                }
            }
        );
    }
}