
DexieCollection = require('../../../../../../lib/storage/indexed-db/dexie/DexieCollection');

class TimeslotDexieCollection extends DexieCollection {

    /**
     * @param {Table} table
     * @param search
     * @return {*}
     * @private
     */
    _search(table, search) {

        let collection = table.toCollection();
        if (search !== null && typeof search === 'object') {

            for (let property in search) {

                switch (property) {
                    case 'tags':
                        collection = table.where(property).equals(search[property]);
                        break;
                    case 'name':
                        collection = table.where(property).startsWithIgnoreCase(search[property]);
                        break;
                }
            }
        }

        return collection;
    }
}

module.exports = TimeslotDexieCollection;