try {
    Match = require('./../../../../lib/sport/model/Match');

}
catch(err) {
    Match = require(__dirname + '/lib/sport/model/Match');

}

class MatchSoccer extends Match {

    constructor() {
        super();

        /**
         * @type {number}
         */
        this.enable = 0;
    }
}

module.exports = MatchSoccer;