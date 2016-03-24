'use strict';

let Q = require('q');

class MediaPlugin {
    constructor(messageHandler, name) {
        this.messageHandler = messageHandler;
        this.players = {};
        this.name = name;
    }

    registerPlayer(id, clazz) {
        if (!this.players[id]) {
            this.players[id] = new clazz(id);
        }
        return this.players[id];
    }

    enable() {
        return Q.reject('Method not implemented');
    }

    disable() {
        return Q.reject('Method not implemented');
    }
}

module.exports = MediaPlugin;
