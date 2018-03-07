
let AbstractHydrator = null;
try {
    AbstractHydrator = require('./AbstractHydrator');
    Utils = require('./../Utils');
}
catch(err) {
    AbstractHydrator = require(__dirname + '/lib/hydrator/AbstractHydrator');
    Utils = require(__dirname + '/lib/Utils');
}

/**
 * Hydrate by method property
 */
class PropertyHydrator extends AbstractHydrator {

    /**
     * @constructor
     * @param {Object} objectPrototype
     * @param {Object} strategies
     * */
    constructor(objectPrototype, strategies) {

        super(strategies ? strategies : null);
        this.objectPrototype = objectPrototype;
        this.enableHydratorProperty = null;
        this.enableExtractorProperty = null;
    }

    /**
     * @param {String} nameProperty
     * @return {PropertyHydrator}
     */
    enableHydrateProperty(nameProperty) {
        if (this.enableHydratorProperty === null) {
            this.enableHydratorProperty = {};
        }
        this.enableHydratorProperty[nameProperty] = true;
        return this;
    }

    /**
     * @param {String} nameProperty
     * @return {PropertyHydrator}
     */
    enableExtractProperty(nameProperty) {
        if (this.enableExtractorProperty === null) {
            this.enableExtractorProperty = {};
        }
        this.enableExtractorProperty[nameProperty] = true;
        return this;
    }

    /**
     * @param {Object} data
     * @returns {Object}
     */
    hydrate(data) {
        super.hydrate(data);
        let obj = this.referenceObject ? this.referenceObject : new this.objectPrototype.constructor();
        for (let property in data) {

            if (this.enableHydratorProperty && !this.enableHydratorProperty[property]) {
                continue;
            }

            obj[property] = this._hydrateProperty(property, data[property]);
        }

        // TODO create strategy
        if (!obj.id) {
            obj.id = Utils.uid;obj
        }

        return obj;
    }

    /**
     *
     * @param name
     * @param value
     * @private
     */
    _hydrateProperty(name, value) {

        let strategy = this.strategies[name];

        let data = value;
        if (strategy) {

            if (
                this.referenceObject !== null &&
                typeof this.referenceObject === 'object' &&
                this.referenceObject[name] !== null &&
                typeof this.referenceObject[name] === 'object'
            ) {
                strategy.referenceObject = this.referenceObject[name]
            }

            data = strategy.hydrateStrategy(data);
        }
        return data;
    }

    /**
     * @param {Object} obj
     * @returns {Object}
     */
    extract(obj) {
        super.extract(obj);
        let data = {};
        for (let property in obj) {

            if (this.enableExtractorProperty && !this.enableExtractorProperty[property]) {
                continue;
            }

            data[property] = (this.strategies[property]) ?
                this.strategies[property].extractStrategy(obj[property]) :
                obj[property];
        }

        // TODO create strategy
        if (!data.id) {
            data.id = Utils.uid;
        }

        return data;
    }

}

module.exports = PropertyHydrator;