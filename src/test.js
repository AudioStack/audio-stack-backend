'use strict';

var express = require('express');
var app = new express();
var expressWs = require('express-ws')(app);

var order = [];
var players = {};
var sockets = {};

class Player {
    constructor(id) {
        this.id = id;
        if (!players[id]) {
            players[id] = this;
        }
        this.state = null;
    }

    play() {
        this.sendCommand('play');
    }

    pause() {
        this.sendCommand('pause');
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

function registerPlayer(id) {
    if (!players[id]) {
        return new Player(id);
    } else {
        return players[id];
    }
}

app.get('/', (req, res) => {
    res.status(200).send('<h1>Audio-Stack API server</h1><p>You shouldn\'t be here.</p>')
});

app.ws('/plugin', (ws, req) => {
    ws.on('message', function(msg) {
        msg = JSON.parse(msg);
        sockets[msg.player] = ws;
        console.log(msg);

        var player = registerPlayer(msg.player);
        var oldState = player.state;
        switch (msg.event) {
            case 'playing':
            case 'paused':
            case 'finished':
                player.state = msg.event;
                break;
            default: return;
        }
        var index = order.indexOf(player);
        if (index !== -1 && ((player.state === 'playing' && oldState !== 'playing') || player.state === 'finished')) {
            order.splice(index, 1);
        }
        if (oldState !== 'finished' && player.state === 'finished') {
            if (order.length > 0) {
                var nextPlayer = order[0];
                if (nextPlayer.state !== 'playing') {
                    nextPlayer.play();
                }
            }
        }
        if (oldState !== 'playing' && player.state === 'playing') {
            order.unshift(player);
            if (order.length > 1) {
                var oldPlayer = order[1];
                if (oldPlayer.state === 'playing') {
                    oldPlayer.pause();
                }
            }
        }

        console.log('\nOrder:');
        for (var i in order) {
            var str = "";
            var player = order[i];

            switch (player.state) {
                case 'playing':
                    str+='> ';
                    break;
                case 'paused':
                    str+='||';
                    break;
                case 'finished':
                    str+='__';
                    break;
            }
            str+= ' ' + player.id;
            console.log(str);
        }
    })
});

//var privateKey = fs.readFileSync( './key.pem' );
//var certificate = fs.readFileSync( './cert.pem' );
//
//https.createServer({
//    key: privateKey,
//    cert: certificate
//}, app).listen(3000);

app.listen(3000);
