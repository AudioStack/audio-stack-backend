"use strict";

let MediaPlugin = require('../mediaplugin');
let Player = require('../../model/player');
let express = require('express');
let expressWs = require('express-ws')
let Q = require('q');

var sockets = {};

class WebSocketPlayer extends Player {
    constructor(id) {
        super(id);
    }

    play() {
        this.sendCommand('play');
        super.play();
    }

    pause() {
        this.sendCommand('pause');
        super.play();
    }

    sendCommand(command) {
        var socket = sockets[this.id];
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                player: this.id,
                command: command
            }));
        }
    }
}

class WebsocketPlugin extends MediaPlugin {
    constructor(messageHandler) {
        super(messageHandler, 'websocket');
    }

    enable(cb) {
        this.app = new express();
        expressWs(this.app);

        this.app.get('/', (req, res) => {
            res.status(200).send('<h1>Audio-Stack API server</h1><p>You shouldn\'t be here.</p>')
        });

        var self = this;

        this.app.ws('/plugin', (ws, req) => {
            ws.on('message', function(msg) {
                msg = JSON.parse(msg);
                sockets[msg.player] = ws;
                var player = self.registerPlayer(msg.player, WebSocketPlayer);
                self.messageHandler(msg, player);
            })
        });

        var deferred = Q.defer();
        this.server = this.app.listen(3000, deferred.resolve);
        return deferred.promise;
    }

    disable() {
        this.server.close();
        return Q.resolve();
    }
}

module.exports = WebsocketPlugin;
