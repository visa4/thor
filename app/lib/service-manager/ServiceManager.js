
class ServiceManager {

    /**
     *
     */
    constructor () {
        this.services = {};
    }

    /**
     * @param name
     * @param service
     * @returns {ServiceManager}
     */
    set(name, service) {
        this.__checkNameService(name);
        this.services[name] = service;
        return this;
    }

    /**
     * @param name
     * @returns {boolean}
     */
    has(name) {
        return Boolean(this.services[name]);
    }

    /**
     * @param name
     * @returns {*}
     */
    get(name) {
        this.__checkNameService(name);
        if (typeof this.services[name] === 'function') {
            this.services[name] = this.services[name](this);
        }
        return this.services[name];
    }

    /**
     * @return {Array}
     */
    getAll() {
        let services = [];
        for (let key in this.services) {
            services.push(this.get(key));
        }
        return services;
    }

    /**
     * @param name
     * @private
     */
    __checkNameService(name) {
        if (!(typeof name === 'string')) {
            throw 'Wrong type service'
        }
    }

    /**
     * @returns ServiceManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new ServiceManager();
        }
        return this.instance;
    }
}

module.exports = ServiceManager;