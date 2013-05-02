/**
 * video-stream.js
 * Handles all socket communication involving rover video
 *
 * License: GPL
 */


// ### Core Modules
var util = require('util'),
    net = require('net');

// ### Dependencies
var vdebug = require('debug')('comm:video'),
    commands = require('./../control/commands');

module.exports = function (imgData) {

    var vSock;

    function getVideo () {
        vSock = net.createConnection(config.ROVER_PORT, config.ROVER_HOST);
        vSock.on('connect', function () {
            vdebug('video socket connected');
            var instr = commands.GET_VIDEO(imgData)
            vdebug('instr: ' + util.inspect(instr));
            vSock.write(instr);
        });

        vSock.on('data', function (data) {
            vdebug('video data: ' + util.inspect(data));
        });

        vSock.on('disconnect', function () {
            vdebug('video socket disconnected');
        });

        vSock.on('error', function (err) {
            vdebug('video socket error' + util.inspect(err));
        });
    }
};