try {
    Player = require('./../../../../lib/sport/model/Player');

}
catch(err) {
    Player = require(__dirname + '/lib/sport/model/Player');

}

class PlayerSoccer extends Player {

    static get POSITION_GAOLKEEPER() { return 'portiere'; };

    static get POSITION_DEFENDER() { return 'difensore'; };

    static get POSITION_MIDFIELDER() { return 'centrocampista'; };

    static get POSITION_STRIKER() { return 'attaccante'; };

    static get STATUS_ROSTRUM() { return 'rostrum'; };

    static get STATUS_BENCH() { return 'bench'; };

    static get STATUS_HOLDER() { return 'holder'; };

    constructor() {
        super();

        /**
         * @type {null|String}
         */
        this.shirtName = null;

        /**
         * @type {null|Number}
         */
        this.shirtNumber = null;

        /**
         * @type {null|string}
         */
        this.position = null;

        /**
         * @type {Array}
         */
        this.goals = [];

        /**
         * @type {Array}
         */
        this.cards = [];

        /**
         * @type {String}
         */
        this.status = PlayerSoccer.STATUS_ROSTRUM;

    }

    /**
     * @param {Card} card
     */
    addCard(card) {

        if (this.isExpelled()) {
            return;
        }

        this.cards.push(card);
    }

    /**
     * @returns {boolean}
     */
    hasNoCard() {
        return this.cards.length === 0;
    }

    /**
     * @returns {boolean}
     */
    isWarning() {

        let yellowCount = 0;
        for (let cont = 0; this.cards.length > cont; cont++) {
            if (this.cards[cont].type === Card.TYPE_YELLOW ) {
                yellowCount++;
            }
        }
        return yellowCount === 1;
    }

    /**
     * @returns {boolean}
     */
    isExpelled() {


        let yellowCount = 0;
        for (let cont = 0; this.cards.length > cont; cont++) {
            if (this.cards[cont].type === Card.TYPE_YELLOW ) {
                yellowCount++;
            }
        }

        let red = !!this.cards.find((elem) => {
            return elem.type === Card.TYPE_RED;
        });

        return red || yellowCount >= 2;
    }
}

module.exports = PlayerSoccer;