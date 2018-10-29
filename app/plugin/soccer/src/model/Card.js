class Card {

    static get TYPE_RED() { return 'red' };

    static get TYPE_YELLOW() { return 'yellow' };

    static get TYPE_DOUBLE_YELLOW() { return 'double-yellow' };

    constructor() {

        this.type = Goal.TYPE_YELLOW;

        this.time = null;
    }
}

module.exports = Card;