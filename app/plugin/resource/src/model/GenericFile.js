
class GenericFile {

    constructor() {
        this.location = {};
        this.size = null;
        this.type = null;
        this.name = null;
    }

    getPath() {
        let path = null;
        if (typeof this.location === 'object' && this.location !== null) {
            path = this.location.path + this.location.name;
        }
        return path;
    }
}

module.exports = GenericFile;