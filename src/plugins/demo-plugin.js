'use strict';

var MediaPlugin = require('./mediaplugin');

class DemoPlugin extends MediaPlugin {
    constructor(mediastack) {
        super(mediastack);
    }

    play() {
        this.state = "PLAYING";
        return Promise.resolve();
    }

    pause() {
        this.state = "PAUSED";
        return Promise.resolve();
    }
}

module.exports = DemoPlugin;
