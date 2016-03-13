'use strict';

class MediaStack {
    constructor() {
        this.stack = [];
        this.mediaByUUID = {};
    }

    putAndPlay(media) {
        var current = this.getCurrent();
        this.stack.unshift(media);
        this.mediaByUUID[media.id] = media;
        if (current) {
            current.pause().then(function() {
                media.play();
            });
        } else {
            media.play();
        }
    }

    getCurrent() {
        return this.stack[0];
    }
}
