/**
 * Abstract class to hydrate object
 */
class AbstractHydrator {

    /**
     * @param obj
     * @param data
     */
    hydrate(obj, data) {
        if(typeof obj !== 'object' || obj === null) {
            throw 'Wrong obj for hydrate';
        }
    }
}