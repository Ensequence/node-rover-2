/**
 * rover.js
 * Main rover control
 *
 * License: GPL
 */

// ### Core Modules
var util = require('util');

// ### Dependencies
var init = require('./init'),
    commands = require('./commands'),
    debug = require('debug')('comm:rover');

// ### Exports
module.exports = (function () {
    // Container for command socket
    var cSock;

    // ### connect
    // Establishes connection with rover 2.0
    //
    // * `cb`: [Optional] function to deliver error if occurs
    function connect (cb) {
        init(function (err, sock) {
            if (cb) {
                if (err) return cb(err);
                cb();   
            }
            cSock = sock;
        });
    }

    // ### disconnect
    // Disconnects from rover
    function disconnect () {
        cSock.close();
        cSock = null;
    }

    // ### forwardLeft
    // Move left track forward
    function forwardLeft () {
        var instr = commands.LEFT_FORWARD();
        debug('sending left forward: ' + util.inspect(instr));

        cSock.write(instr);
    }

    // ### forwardRight
    // Move left track forward
    function forwardRight () {
        var instr = commands.RIGHT_FORWARD();
        debug('sending right forward: ' + util.inspect(instr));

        cSock.write(instr);
    }

    // ### reverseLeft
    // Move right track forward
    function reverseLeft () {
        var instr = commands.LEFT_REVERSE();
        debug('sending left reverse: ' + util.inspect(instr));

        cSock.write(instr);
    }

    // ### reverseRight
    // Move left track forward
    function reverseRight () {
        var instr = commands.RIGHT_REVERSE();
        debug('sending right reverse: ' + util.inspect(instr));

        cSock.write(instr);
    }

    // ### forward
    // Move both tracks forward
    function forward () {
        cSock.write(commands.LEFT_FORWARD());
        cSock.write(commands.RIGHT_FORWARD());
    }

    // ### reverse
    // Move both tracks backward
    function reverse () {
        cSock.write(commands.LEFT_REVERSE());
        cSock.write(commands.RIGHT_REVERSE());
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
        reverse: reverse
    };
})();