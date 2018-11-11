class MediaDevice {

    static get TYPE_VIDEO() { return 'video'; };

    static get TYPE_AUDIO() { return 'audio'; };

    constructor() {

        /**
         * @type {string}
         */
        this.type = '';

        /**
         * @type {string}
         */
        this.groupId = '';

        /**
         * @type {string}
         */
        this.label = '';
    }
}
module.exports = MediaDevice;
