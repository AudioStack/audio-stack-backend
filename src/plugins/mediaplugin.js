'use strict';

class MediaPlugin {
    constructor(mediastack) {
        this.state = null;
        this.stack = mediastack;
    }

    play() {
        return Promise.reject("Default implementation");
    }

    pause() {
        return Promise.reject("Default implementation");
    }

    getState() {
        return this.state;
    }
}

module.exports = MediaPlugin;
