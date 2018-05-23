
class Image extends GenericFile {

    constructor() {
        super();
        this.dimension = [];

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'image'}
        );
    }
}

module.exports = Image;