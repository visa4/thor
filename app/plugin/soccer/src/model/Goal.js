class Goal {

    static get TYPE_AUTO() { return 'autogoal' };

    static get TYPE_STARNDARD() { return 'standard' };

    constructor() {

        this.type = Goal.TYPE_AUTO;

        this.time = null;
    }
}

module.exports = Goal;