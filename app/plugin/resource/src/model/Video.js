
class Video extends GenericFile {

    constructor() {
        super();
        this.duration = null;
        this.dimension = {};

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'video'}
        );
    }
}

module.exports = Video;