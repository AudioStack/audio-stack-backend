var ports = {};
var reconnectTime = 1000;

var connection = null;

var sendBuffer = [];

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function(msg) {
        if (connection.readyState !== 1 && connection.readyState !== 0) {
            reconnect();
        }
        if (connection.readyState === 1) {
            connection.send(JSON.stringify(msg));
        } else {
            sendBuffer.push(msg);
        }
        console.log(msg);
        ports[msg.player] = port;
    })
});

chrome.alarms.onAlarm.addListener(function(alarm) {
   if (alarm.name === 'reconnect') {
       connect();
   }
});

function cancelAlarm() {
    try {
        chrome.alarms.cancel('reconnect');
    } catch (e) {
    }
}
function reconnect() {
    cancelAlarm();
    chrome.alarms.create('reconnect', {
        when: Date.now() + reconnectTime
    });
    console.log("reconnecting in", reconnectTime / 1000, 'seconds');
}

function connect() {
    cancelAlarm();
    connection = new WebSocket('ws://localhost:3000/plugin');

    connection.onopen = function () {
        reconnectTime = 1000;
        console.log('connected. sending buffer ...');

        for (var i = 0; i < sendBuffer.length; i++) {
            connection.send(JSON.stringify(sendBuffer[i]));
        }

        sendBuffer = [];
    };

    connection.onerror = function (err) {
        console.log("WebSocket err", err);
        reconnectTime += 10000;
    };

    connection.onmessage = function (msg) {
        msg = JSON.parse(msg.data);
        console.log('Server:', msg);
        if (msg.player) {
            var port = ports[msg.player];
            if (port) {
                port.postMessage(msg);
            }
        }
    };

    connection.onclose = function () {
        console.log('connection to websocket lost');
        reconnect();
    };
}

connect();
