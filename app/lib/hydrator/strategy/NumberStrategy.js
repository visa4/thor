/**
 *
 */
class NumberStrategy {

    /**
     *
     * @param data
     * @returns {*}
     */
    hydrateStrategy(data) {

        let hydrate = data;
        if (typeof data === 'string') {
            hydrate = parseFloat(data);
        }
        return hydrate;
    }

    /**
     *
     * @param data
     * @returns {{}|*}
     */
    extractStrategy(data) {
        let extract = data;
        if (typeof data === 'string') {
            extract = parseFloat(data);
        }
        return extract;
    }

}

module.exports = NumberStrategy;