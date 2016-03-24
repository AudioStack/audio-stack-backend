"use strict";

let MediaPlugin = require('../mediaplugin');
let spawn = require('child_process').spawn;
var Player = require('../../model/player');
let applescript = require('applescript');
let Q = require('q');

class OSXPlayer extends Player {
    constructor(id) {
        super(id);
    }

    play() {
        super.play();
        applescript.execString('tell app "' + this.type + '" to play');
    }

    pause() {
        super.pause();
        applescript.execString('tell app "' + this.type + '" to pause');
    }
}

class OSXPlugin extends MediaPlugin {
    constructor(messageHandler) {
        super(messageHandler, 'osx');
    }

    enable() {
        var deferred = Q.defer();
        this.iTunes = spawn(__dirname+'/iTunesListener', [], {
            cwd: __dirname
        });

        this.iTunes.on('error', function(err) {
            deferred.reject(err);
        });

        var self = this;

        var pristine = true;
        this.iTunes.stdout.on('data', function(data) {
            if (pristine) {
                deferred.resolve();
                pristine = false;
            } else {
                data = JSON.parse(data.toString());
                var player = self.registerPlayer(data.source, OSXPlayer);
                player.type = data.source;
                self.messageHandler(data, player);
            }
        });

        return deferred.promise;
    }

    disable() {
        var deferred = Q.defer();
        this.iTunes.on('exit', function(code, signal) {
            if (!signal) {
                deferred.resolve();
            } else {
                deferred.reject('Exited with signal ' + signal);
            }
        });
        this.iTunes.on('error', function(err) {
            deferred.reject(err);
        });
        if (this.iTunes.connected) {
            this.iTunes.kill();
        }
        return deferred.promise;
    }
}

module.exports = OSXPlugin;
