class Goal {

    static get TYPE_AUTO() { return 'autogoal' };

    static get TYPE_STANDARD() { return 'standard' };

    constructor() {

        this.type = Goal.TYPE_STANDARD;

        this.time = null;
    }
}

module.exports = Goal;