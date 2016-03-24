'use strict';

class MediaStack {
    constructor() {
        this.stack = [];
        this.mediaByUUID = {};
    }

    putAndPlay(player) {
        var current = this.getCurrent();
        this.stack.unshift(player);
        this.mediaByUUID[player.id] = player;
        if (current) {
            current.pause().then(function() {
                player.play();
            });
        } else {
            player.play();
        }
    }

    getCurrent() {
        return this.stack[0];
    }
}
