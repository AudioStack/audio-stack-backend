function generateGuid() {
    var result, i, j;
    result = '';
    for(j=0; j<32; j++) {
        if( j == 8 || j == 12|| j == 16|| j == 20)
            result = result + '-';
        i = Math.floor(Math.random()*16).toString(16).toUpperCase();
        result = result + i;
    }
    return result;
}

var port = chrome.runtime.connect({name: 'audiostack'});

var players = {};

// username: #watch7-user-header > div > a
// title: #eow-title

port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (players[msg.player]) {
        var player = players[msg.player];
        switch (msg.command) {
            case 'play':
                player.play();
                //playing(msg.player);
                break;
            case 'pause':
                player.pause();
                //paused(msg.player);
                break;
        }
    }
});

window.onunload = function() {
    for (var key in players) {
        if (players.hasOwnProperty(key))
            ended(key);
    }
}

function playing(id) {
    console.log('Media', id, 'is now playing');
    port.postMessage({
        event: 'playing',
        player: id
    })
}

function paused(id) {
    console.log('Media', id, 'is now paused');
    port.postMessage({
        event: 'paused',
        player: id
    })
}

function ended(id) {
    console.log('Media', id, 'has ended playback');
    port.postMessage({
        event: 'finished',
        player: id
    })
}

function registerMedia(element) {
    if (!element.guid) {
        element.guid = generateGuid();
    }
    if (!players[element.guid]) {
        players[element.guid] = element;
        console.log('Found player', element);

        if (!element.paused) {
            playing(element.guid);
        }

        element.addEventListener('playing', function() {
            playing(element.guid);
        });

        element.addEventListener('pause', function() {
            paused(element.guid);
        });

        element.addEventListener('ended', function() {
            ended(element.guid);
        });
    }
}


function findMedia(element) {
    if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
        registerMedia(element);
    } else {
        for (var i = 0; i < element.children.length; i++) {
            findMedia(element.children[i]);
        }
    }
}

document.addEventListener('DOMSubtreeModified', function(event) {
    findMedia(event.target);
    //console.log(event.target.children);
})
