"use strict";

let MediaPlugin = require('../mediaplugin');
let Player = require('../../model/player');
let express = require('express');
let expressWs = require('express-ws')
let Q = require('q');
let _ = require('lodash')

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
        this.guiSockets = []

        let self = this;
        messageHandler.on('player-state', (msg, player) => {
            self.emitToGUI({
                playerState: msg,
                player: player
            })
        })
        messageHandler.on('order-change', (order) => {
            self.emitToGUI({order})
        })
    }

    emitToGUI(message) {
        _(this.guiSockets).forEach((socket) => {
            if (socket.readyState ===1 ) {
                socket.send(JSON.stringify(message))
            }
        })
    }

    enable(cb) {
        this.app = new express();
        expressWs(this.app);

        this.app.get('/', (req, res) => {
            res.status(200).send('<h1>Audio-Stack API server</h1><p>You shouldn\'t be here.</p>')
        });

        var self = this;
        var pluginSockets = [];

        this.app.ws('/plugin', (ws, req) => {
            pluginSockets.push(ws)
            ws.on('message', function(msg) {
                msg = JSON.parse(msg);
                sockets[msg.player] = ws;
                var player = self.registerPlayer(msg.player, WebSocketPlayer);
                self.messageHandler(msg, player);
            })
        });

        this.app.ws('/gui', (ws, req) => {
          self.guiSockets.push(ws)

          ws.send(JSON.stringify({hello: "world"}))
        })

        var deferred = Q.defer();
        this.server = this.app.listen(4564, deferred.resolve);
        return deferred.promise;
    }

    disable() {
        this.server.close();
        return Q.resolve();
    }
}

module.exports = WebsocketPlugin;
