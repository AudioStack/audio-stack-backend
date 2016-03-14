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

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var port = chrome.runtime.connect({name: 'audiostack'});

var players = {};
var tracklist = {};

// username: #watch7-user-header > div > a
// div.iv-branding-context-name
// title: #eow-title
// div.ytp-title > div > a.ytp-title-link > span:nth-child(2)

port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (players[msg.player]) {
        var player = players[msg.player];
        switch (msg.command) {
            case 'play':
                var volume = player.persistentVolume || player.volume;
                fadeVolume(player, 0, volume, 200);
                player.play();
                //playing(msg.player);
                break;
            case 'pause':
                player.persistentVolume = player.volume;
                fadeVolume(player, player.volume, 0, 200, function() {
                    player.pause();
                    player.volume = player.persistentVolume;
                });
                //paused(msg.player);
                break;
        }
    }
});

function fadeVolume(media, from, to, duration, cb) {
    media.volume = from;
    console.log(media.volume);
    var value = from;
    var steps = duration / (1000 / 60);
    var progressPerStep = (to - from) / steps;
    var step = 0;
    var interval = window.setInterval(function() {
        value += progressPerStep;
        media.volume = value;
        console.log(media.volume);
        step++;
        if (step >= steps - 1) {
            window.clearInterval(interval);
            media.volume = to;
            if (cb) {
                cb();
            }
        }
    }, 1000/60)
}

window.onunload = function() {
    for (var key in players) {
        if (players.hasOwnProperty(key))
            ended(key);
    }
}

var titleQueries = [
    '#eow-title', //youtube
    'div.ytp-title > div > a.ytp-title-link > span:nth-child(2)', //youtube embed
    'div.controls-wrapper > div.title.invisible.hidden > header > div.headers > h1 > a', //vimeo staff picks
    '#main > div > div > div.clip_main-content.iris_grid-wrapper--content > div:nth-child(1) > div.clip_info-wrapper > div.clip_info > h1 > span:nth-child(1)' //vimeo
];

var artistQueries = [
    '#watch7-user-header > div > a', //youtube
    'div.iv-branding-context-name', //youtube embed
    'div.controls-wrapper > div.title.invisible.hidden > header > div.headers > h2 > a:nth-child(1)', //vimeo staff picks
    '#main > div > div > div.clip_main-content.iris_grid-wrapper--content > div:nth-child(1) > div.clip_info-wrapper > div.clip_info > div > p > span:nth-child(2) > a' //vimeo
];

function trySelector(queries) {
    for (var i in queries) {
        var el = document.querySelector(queries[i]);
        if (el) {
            return el.innerHTML.trim();
        }
    }
    return null;
}

function playing(id, element) {
    tracklist[id] = null;
    var title = trySelector(titleQueries), artist = trySelector(artistQueries);

    var description = document.querySelector('#eow-description');
    if (description) {
        var text = description.innerHTML.replace(/<br>/g, '\n').replace(/<a.*">/g, '').replace(/<\/a>/g, '');

    }

    if (element.muted   ) {
        return;
    }

    console.log('Media', id, 'is now playing');
    port.postMessage({
        event: 'playing',
        player: id,
        meta: {
            title,
            artist,
            url: window.location.href
        }
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
            playing(element.guid, element);
        }

        element.addEventListener('playing', function() {
            playing(element.guid, element);
        });

        element.addEventListener('pause', function() {
            paused(element.guid, element);
        });

        element.addEventListener('ended', function() {
            ended(element.guid, element);
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
