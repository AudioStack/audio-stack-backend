"use strict";

var spawn = require("child_process").spawn;

var nc = spawn('nc', ['-U', '/Users/tux/vlc.sock']);

nc.on('message', function (data) {
    console.log(data);
});

nc.stdout.pipe(process.stdout);

process.stdin.pipe(nc.stdin);
