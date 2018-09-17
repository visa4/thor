
class GenericFile {

    constructor() {

        this._path = require('path');
        this.location = {};
        this.size = null;
        this.type = null;
        this.name = null;
    }

    /**
     * @returns {String}
     */
    getPath() {
        let path = null;
        if (typeof this.location === 'object' && this.location !== null) {
            path = this._path.normalize(this.location.path + this.location.name);
        }
        return path;
    }

    /**
     * @param ext
     * @returns {string}
     */
    static getMimeTypeFromExtension(ext) {
        switch (ext) {
            case 'mp4':
                return 'video/mp4';
            default :
                throw 'Mymetype no match';
        }
    }
}

module.exports = GenericFile;