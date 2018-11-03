class Card {

    static get TYPE_RED() { return 'red' };

    static get TYPE_YELLOW() { return 'yellow' };

    constructor(type = null, time = null) {

        this.type = type;

        this.time = time;
    }
}

module.exports = Card;