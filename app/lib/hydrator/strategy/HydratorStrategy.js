/**
 *
 */
class HydratorStrategy {

    constructor(hydrator) {
        this.hydrator = hydrator ? hydrator : null;
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    hydrateStrategy(data) {
        let hydrate = [];
        if (Array.isArray(data)) {
            for (let cont = 0; data.length > cont; cont++) {
                hydrate[cont] = this.hydrator.hydrate(
                    data[cont]
                );
            }
        } else {
            hydrate = this.hydrator.hydrate(
                data
            );
        }

        return hydrate;
    }

    /**
     *
     * @param data
     * @returns {{}|*}
     */
    extractStrategy(data) {
        let extract = [];
        if (Array.isArray(data)) {
            for (let cont = 0; data.length > cont; cont++) {
                hydrate[cont] = this.hydrator.extract(data[cont]);
            }
        } else {
            extract = this.hydrator.extract(data);
        }

        return extract;
    }

}

module.exports = HydratorStrategy;