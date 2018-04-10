
try {
    HydratorAware = require('./../HydratorAware');
    EvtManager = require('./../EvtManager');
}
catch(err) {

    HydratorAware = require(__dirname + '/lib/hydrator/HydratorAware.js');
    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}
/**
 *
 */
class Storage extends HydratorAware {

    /**
     * @return {number}
     */
    static get DEFAULT_PAGE() {
        return 1;
    }

    /**
     * @return {number}
     */
    static get DEFAULT_ITEM_COUNT() {
        return 10;
    }

    /**
     * @param adapter
     */
    constructor (adapter, hydrator) {
        super(hydrator);
        this.adapter = adapter;
        this.eventManager = new EvtManager();
    }

    /**
     *
     * @param obj
     * @return {Promise}
     */
    save(obj) {
        let data = this.hydrator ? this.hydrator.extract(obj) : obj;
        return this.adapter.save(data);
    }

    update(obj) {
        let data = this.hydrator ? this.hydrator.extract(obj) : obj;
        return this.adapter.update(data);
    }

    /**
     *
     * @param id
     * @return {Promise}
     */
    get(id) {

        let promise = new Promise((resolve, reject) => {
            this.adapter.get(id)
                .then(
                    (data) => {
                        let obj = this.hydrator ? this.hydrator.hydrate(data) : data;
                        resolve(obj);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject(null);
                }
            );
        });

        return promise;
    }

    /**
     * @param search
     * @return {Promise}
     */
    getAll(page, itemCount, search) {

        let promise = new Promise((resolve, reject) => {

            let currentPage = page ? page : Storage.DEFAULT_PAGE;
            let currentItemCount = itemCount ? itemCount : Storage.DEFAULT_ITEM_COUNT;

            this.adapter.getAll(currentPage, currentItemCount, search)
                .then(
                    (data) => {
                        for (let cont = 0; data.length > cont; cont++) {
                            data[cont] = this.hydrator ? this.hydrator.hydrate(data[cont]) : data[cont];
                        }

                        resolve(data);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject([]);
                }
            );
        });

        return promise;
    }

    remove(obj) {
        return this.adapter.remove(obj);
    }


    /**
     *
     * @param obj
     * @return {boolean}
     * @private
     */
    _checkObj(obj) {
        if (!(typeof obj === "object") || obj === null) {
            throw "Wrong obj: obj must be an object"
        }
        return true;
    }
}