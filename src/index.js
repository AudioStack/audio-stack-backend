'use strict';
let OSXPlugin = require('./plugins/osx');
let WebsocketPlugin = require('./plugins/websocket');
let _ = require('lodash');
let Q = require('q');
let ee = require('event-emitter')

var central = ee(handleMessage)

var plugins = [OSXPlugin, WebsocketPlugin].map(function(pl) {
    return new pl(central);
});

module.exports = {
  bootstrap: function() {
    console.log('[ core ]', 'Booting');

    var result = Q(true);
    _.each(plugins, function(pl) {
        result = result.then(function () {
                console.log('[', pl.name, ']', 'Enabling');
            }).then(function() {
                return pl.enable();
            })
            .then(function() {
                console.log('[', pl.name, ']', 'Enabled.');
            }).catch(function(err) {
                console.log('[', pl.name, ']', 'Error enabling:', err);
            })
    });
    result.then(function() {
        console.log('[ core ]', 'Plugins enabled');
    });
  }
}


var order = [];
function handleMessage(msg, player) {
    central.emit('player-state', msg, player)
    var oldState = player.state;

    if (msg.meta) {
        player.meta = msg.meta;
    }

    switch (msg.event) {
        case 'playing':
        case 'paused':
        case 'finished':
        case 'closed':
            player.setState(msg.event);
            break;
        default: return;
    }
    var index = order.indexOf(player);
    if (index !== -1 && ((player.state === 'playing' && oldState !== 'playing') || player.state === 'finished' || player.state === 'closed')) {
        order.splice(index, 1);
    }
    if (oldState !== player.state && (player.state === 'finished' || player.state === 'closed')) {
        if (order.length > 0) {
            var nextPlayer = order[0];
            if (nextPlayer.state !== 'playing' && nextPlayer.automaticState === 'paused') {
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
        }
        str+= ' ' + player.id + ': ' + player.meta.title + ' - ' + player.meta.artist;
        console.log(str);
    }
    central.emit('order-change', order)
}
