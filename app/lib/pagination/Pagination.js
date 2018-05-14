
class Pagination extends Array {


    constructor(items, page, itemPerPage, totalItem) {

        super();
        if (Array.isArray(items)) {
            this.concat(items);
        }

        this.page = page;
        this.itemPerPage = itemPerPage;
        this.totalItems = totalItem;
    }
}

module.exports = Pagination;