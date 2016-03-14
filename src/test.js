'use strict';

var express = require('express');
var app = new express();
var expressWs = require('express-ws')(app);
var nowplaying = require('nowplaying');
var applescript = require('applescript');

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

class NowPlayingPlayer extends Player {
    constructor(id) {
        super(id);
    }

    play() {
        applescript.execString('tell app "' + this.type + '" to play');
    }

    pause() {
        applescript.execString('tell app "' + this.type + '" to pause');
    }
}

nowplaying.on('playing', function(event) {
    var player = registerPlayer(event.source, NowPlayingPlayer);
    player.type = event.source;
    handleMessage({
        player: player.id,
        event: 'playing',
        meta: {
            title: event.name,
            artist: event.artist,
            album: event.album
        }
    }, player);
});

nowplaying.on('paused', function(event) {
    var player = registerPlayer(event.source, NowPlayingPlayer);
    player.type = event.source;
    handleMessage({
        player: player.id,
        event: 'paused'
    }, player);
});

function registerPlayer(id, clazz) {
    if (!players[id]) {
        return new clazz(id);
    } else {
        return players[id];
    }
}

function handleMessage(msg, player) {

    //console.log(msg);

    var oldState = player.state;

    if (msg.meta) {
        player.meta = msg.meta;
    }

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
    if (order.length === 0) {
        console.log('< not playing >');
    }
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
        str+= ' ' + player.id + ' ' + player.meta.title + ' - ' + player.meta.artist;
        console.log(str);
    }
}

app.get('/', (req, res) => {
    res.status(200).send('<h1>Audio-Stack API server</h1><p>You shouldn\'t be here.</p>')
});

app.ws('/plugin', (ws, req) => {
    ws.on('message', function(msg) {
        msg = JSON.parse(msg);
        sockets[msg.player] = ws;
        var player = registerPlayer(msg.player, Player);
        handleMessage(msg, player);
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
