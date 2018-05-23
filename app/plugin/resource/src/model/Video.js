
class Video extends GenericFile {

    constructor() {
        super();
        this.duration = null;

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'video'}
        );
    }
}

module.exports = Video;