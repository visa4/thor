try {
   let GenericFile = require('./GenericFile');
}
catch(err) {
    GenericFile = require(__dirname + '/lib/model/file/GenericFile');
}

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