/**
 *
 */
class LocalStorage extends HydratorAware {

    static get LOCAL_STORAGE_SAVE_EVT() { return 'save'};

    static get LOCAL_STORAGE_UPDATE_EVT() { return 'update'};

    static get LOCAL_STORAGE_REMOVE_EVT() { return 'remove'};

    constructor(namespace, hydrator) {
        super(hydrator);
        this.eventManager = new EvtManager();
        this.namespace = namespace;
        this.data = localStorage.getItem(this.namespace) ? JSON.parse(localStorage.getItem(this.namespace)) : [];
    }

    /**
     * @param obj
     * @returns {Object}
     */
    save(obj) {

        this.__checkObject(obj);
        let data = this.hydrator ? this.hydrator.extract(obj) : obj;
        this.data.push(data);
        this.eventManager.fire(LocalStorage.LOCAL_STORAGE_SAVE_EVT, obj);
        this.__save();
        return obj;
    }

    /**
     * @param obj
     * @returns {Object}
     */
    update(obj) {

        this.__checkObjectId(obj);

        let index = this.__find(obj.id);

        if (index >= 0) {
            this.data[index] = this.hydrator ? this.hydrator.extract(obj) : obj;
            this.eventManager.fire(LocalStorage.LOCAL_STORAGE_UPDATE_EVT, this.data[index]);
            this.__save();
        }

        return obj;
    }


    /**
     *
     * @param id string
     * @returns {boolean}
     */
    remove(id) {

        this.__checkId(id);
        let index = this.__find(id);

        if (index >= 0) {
            this.eventManager.fire(
                LocalStorage.LOCAL_STORAGE_REMOVE_EVT,
                this.hydrator ? this.hydrator.hydrate(this.data[index]) : this.data[index]
            );
            this.data.splice(index, 1);
            this.__save();
            return true;
        }
        return false;
    }

    /**
     * @returns Array
     */
    getAll() {
        let data = [];
        for (let cont = 0; cont < this.data.length; cont++) {
            data.push(
                this.hydrator ?
                    this.hydrator.hydrate(this.data[cont]) :
                    this.data[cont]
            );
        }
        return data;
    }

    /**
     * @returns Array
     */
    get(id) {

        this.__checkId(id);

        let find = this.__find(id);

        if (find >= 0) {
            return this.hydrator ?
                this.hydrator.hydrate(this.data[find]) :
                this.data[find];
        }
        return null;
    }

    /**
     * @param obj
     * @private
     */
    __checkObject(obj) {
        if (!(typeof obj === "object")) {
            throw "Wrong obj: obj must be an object"
        }
    }

    /**
     * @param obj
     * @private
     */
    __checkObjectId(obj) {
        this.__checkObject(obj);
        if (!obj.id) {
            throw "Wrong obj: identifier not found"
        }
    }

    /**
     * @param id
     * @private
     */
    __checkId(id) {
        if (!typeof id === 'string' || !typeof id === 'number') {
            throw 'Wrong value for id'
        }
    }

    /**
     * @returns {LocalStorage}
     * @private
     */
    __save() {

        localStorage.setItem(this.namespace, JSON.stringify(this.data));
        return this;
    }

    /**
     * @param id string
     * @returns {number}
     * @private
     */
    __find (id) {
        return this.data.findIndex(
            function (element) {
                if (element.id === id) {
                    return true;
                }
            }
        );
    }
}