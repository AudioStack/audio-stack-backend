'use strict';

class Media {
    constructor(options) {
        this.title = options.title | "(unnamed)";
        this.artist = options.artist | "(unknown)";
        this.album = options.album | null;
        this.id = options.id;
        if (!this.id) {
            throw new Error("Must supply UUID (options.id missing)");
        }
    }

    play() {

    }

    pause() {

    }
}
