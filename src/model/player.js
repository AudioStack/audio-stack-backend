"use strict";

class Player {
    constructor(id) {
        this.id = id;
        this.state = null;
    }

    play() {
        this.waitingFor = 'playing';
        this.automaticState = 'playing';
    }

    pause() {
        this.waitingFor = 'paused';
        this.automaticState = 'paused';
    }

    setState(state) {
        if (this.state === state) {
            return;
        }
        if (this.waitingFor !== state) {
            this.automaticState = null;
        }
        this.waitingFor = null;
        this.state = state;
    }

}

module.exports = Player;
