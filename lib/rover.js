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
    debug = require('debug')('comm:rover'),
    q = require('q');

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
        var deferred = q.defer();
        init(function (err, data) {
            // Capture rover socket
            if (data) {
                cSock = data.socket;
                imgData = data.imgData;
            }

            // Resolve promise
            if (err) deferred.reject(err);
            else deferred.resolve();

            // Handle callback if provided
            if (cb) {
                if (err) return cb(err);
                cb();
            }
        });

        return deferred.promise;
    }

    // ### disconnect
    // Disconnects from rover
    function disconnect () {
        cSock.end();
        cSock = null;
    }

    // ### spin
    // Spin rover
    function spin(direction, duration, cb) {
        if (typeof direction == 'number') duration = direction;
        if (direction == 'clockwise') {
            debug('spinning clockwise');
            return _cmdOverTime([commands.LEFT_FORWARD(), commands.RIGHT_REVERSE()], duration, cb);
        } else {
            debug('spinning counter-clockwise');
            return _cmdOverTime([commands.RIGHT_FORWARD(), commands.LEFT_REVERSE()], duration, cb);
        }
    }

    // API object to deliver
    var api = {
        connect: connect,
        disconnect: disconnect,
        spin: spin
    };

    // Map api methods to rover commands
    var apiCommands = {
        forwardLeft: [commands.LEFT_FORWARD()],
        forwardRight: [commands.RIGHT_FORWARD()],
        reverseLeft: [commands.LEFT_REVERSE()],
        reverseRight: [commands.RIGHT_REVERSE()],
        stopLeft: [commands.LEFT_STOP()],
        stopRight: [commands.RIGHT_STOP()],
        forward: [commands.LEFT_FORWARD(), commands.RIGHT_FORWARD()],
        reverse: [commands.LEFT_REVERSE(), commands.RIGHT_REVERSE()],
        stop: [commands.LEFT_STOP(), commands.RIGHT_STOP()],
        cameraUp: [commands.CAMERA_UP()],
        cameraDown: [commands.CAMERA_DOWN()],
        cameraStop: [commands.CAMERA_STOP()]
    };

    // Build api call for each command
    Object.keys(apiCommands).forEach(function (method) {
        var instr = apiCommands[method];
        api[method] = function (duration, cb) {
            return _cmdOverTime(instr, duration, cb);
        };
    });

    // ### _cmdOverTime
    // Executes given instruction for specified period of time
    //
    // * `instr`: data to send to rover
    // * `duration`: period of time to carry out instruction
    function _cmdOverTime (instr, duration, cb) {
        var deferred = q.defer();

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
                debug('finished cmd');
                deferred.resolve();
                if (cb) cb();
                clearInterval(cmdInterval);
                return;
            }

            _writeData(instr);
            counter++;
            debug('running command: ' + (counter + 1));
        }, CMD_INTERVAL);

        return deferred.promise;
    }

    // ### _writeData
    // Writes data to command socket.  May write multiple commands.
    //
    // * `instr`: Buffer or array of buffers to write to socket
    function _writeData (instr) {
        instr = instr instanceof Array ? instr : [instr];
        instr.map(function (data) { cSock.write(data); });
    }

    return api;
})();
