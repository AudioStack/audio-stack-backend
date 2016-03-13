var connection = new WebSocket('ws://localhost:3000/plugin');

var ports = {};
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function(msg) {
        connection.send(JSON.stringify(msg));
        console.log(msg);
        ports[msg.player] = port;
    })
});

connection.onmessage = function(msg) {
    msg = JSON.parse(msg.data);
    console.log('Server:', msg);
    if (msg.player) {
        var port = ports[msg.player];
        if (port) {
            port.postMessage(msg);
        }
    }
};
