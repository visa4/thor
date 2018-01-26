/**
 * Hydrate by method property
 */
class PropertyHydrator extends AbstractHydrator {

    /**
     * @param obj
     * @param data
     * @returns {*}
     */
    hydrate(obj, data) {
        super.hydrate(obj, data);

        for (let property in data) {
            if (data.hasOwnProperty(property)) {
                //console.log("HYDRATE PROPERTY " + property + " value " + data[property]);
                obj[property] = data[property];
            }
        }

        // TODO create strategy
        if (!obj.id) {
            obj.id = Utils.uid;
        }

        return obj;
    }

    /**
     * @param obj
     * @returns {{}}
     */
    extract(obj) {
        let data = {};
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                //console.log("EXTRACT PROPERTY " + property + " value " + obj[property]);
                data[property] = obj[property];
            }
        }

        // TODO create strategy
        if (!data.id) {
            data.id = Utils.uid;
        }

        return data;
    }

}