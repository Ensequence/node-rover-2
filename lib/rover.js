/**
 * rover.js
 * Main rover control
 *
 * License: GPL
 */

// ### Core Modules
var util = require('util'),
    net = require('net');

// ### Dependencies
var init = require('./connect/init'),
    config = require('./config'),
    commands = require('./control/commands'),
    debug = require('debug')('comm:rover');

// ### Exports
module.exports = (function () {
    // Container for command socket
    var cSock;

    // Default interval to send commands over time
    var CMD_INTERVAL = 1000;

    // ### connect
    // Establishes connection with rover 2.0
    //
    // * `cb`: [Optional] function to deliver error if occurs
    function connect (cb) {
        init(function (err, data) {
            if (cb) {
                if (err) return cb(err);
                cb();   
            }
            cSock = data.sock;
            imgData = data.imgData;
        });
    }

    // ### disconnect
    // Disconnects from rover
    function disconnect () {
        cSock.end();
        cSock = null;
    }

    // ### forwardLeft
    // Move left track forward
    //
    // * `duration`: period of time to carry out instruction
    function forwardLeft (duration) {
        var instr = commands.LEFT_FORWARD();
        debug('starting left forward');

        _cmdOverTime(instr, duration);
    }

    // ### forwardRight
    // Move right track forward
    //
    // * `duration`: period of time to carry out instruction
    function forwardRight (duration) {
        var instr = commands.RIGHT_FORWARD();
        debug('starting right forward');

        _cmdOverTime(instr, duration);
    }

    // ### reverseLeft
    // Move right track backward
    //
    // * `duration`: period of time to carry out instruction
    function reverseLeft (duration) {
        var instr = commands.LEFT_REVERSE();
        debug('starting left reverse');

        _cmdOverTime(instr, duration);
    }

    // ### reverseRight
    // Move right track backward
    //
    // * `duration`: period of time to carry out instruction
    function reverseRight (duration) {
        var instr = commands.RIGHT_REVERSE();
        debug('starting right reverse');

        _cmdOverTime(instr, duration);
    }

    // ### forward
    // Move both tracks forward
    function forward (duration) {
        debug('starting forward');
        _cmdOverTime([commands.LEFT_FORWARD(), commands.RIGHT_FORWARD()], duration);
    }

    // ### reverse
    // Move both tracks backward
    function reverse (duration) {
        debug('starting reverse');
        _cmdOverTime([commands.LEFT_REVERSE(),commands.RIGHT_REVERSE()], duration);
    }

    // ### cameraUp
    // Move camera up.  Will continue until stopped.
    function cameraUp () {
        debug('starting camera up');
        _cmdOverTime(commands.CAMERA_UP());
    }

    // ### cameraDown
    // Move camera down.  Will continue until stopped.
    function cameraDown () {
        debug('starting camera down');
        _cmdOverTime(commands.CAMERA_DOWN());
    }

    // ### cameraStop
    // Stop all camera movement
    function cameraStop () {
        debug('stopping camera');
        _cmdOverTime(commands.CAMERA_STOP());
    }

    // ### spin
    // Spin rover
    function spin(direction, duration) {
        if (typeof direction == 'number') duration == direction;
        if (direction == 'clockwise') {
            debug('spinning clockwise');
            _cmdOverTime([commands.LEFT_FORWARD(), commands.RIGHT_REVERSE()], duration);
        } else {
            debug('spinning counter-clockwise');
            _cmdOverTime([commands.RIGHT_FORWARD(), commands.LEFT_REVERSE()], duration);
        }
    }

    // ### _cmdOverTime
    // Executes given instruction for specified period of time
    //
    // * `instr`: data to send to rover
    // * `duration`: period of time to carry out instruction
    function _cmdOverTime (instr, duration) {
        // Set default duration if necessary
        duration = duration || CMD_INTERVAL;

        // Determine number of executions for given duration
        var numExecutions = Math.floor((duration - CMD_INTERVAL) / CMD_INTERVAL),
            counter = 0;

        debug('running command ' + numExecutions + ' times in total');

        // Send initial set
        debug('running command: ' + (counter + 1));
        _writeData(instr);

        // Create interval to conduct remaining executions
        var cmdInterval = setInterval(function () {
            if (counter == numExecutions) {
                clearInterval(cmdInterval);
                return;
            }

            _writeData(instr);
            counter++;
            debug('running command: ' + (counter + 1));
        }, CMD_INTERVAL);
    }

    // ### _writeData
    // Writes data to command socket.  May write multiple commands.
    //
    // * `instr`: Buffer or array of buffers to write to socket
    function _writeData (instr) {
        instr = instr instanceof Array ? instr : [instr];
        instr.map(function (data) { cSock.write(data); });
    }

    // Expose methods
    return {
        connect: connect,
        disconnect: disconnect,
        forwardLeft: forwardLeft,
        forwardRight: forwardRight,
        reverseLeft: reverseLeft,
        reverseRight: reverseRight,
        forward: forward,
        reverse: reverse,
        cameraUp: cameraUp,
        cameraDown: cameraDown,
        cameraStop: cameraStop,
        spin: spin
    };
})();