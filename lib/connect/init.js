/**
 * Handles initialization of communication with rover 2.0
 *
 * Author: Steven White
 * License: GPL
 */

// ### Core Modules
var net = require('net'),
    util = require('util');

// ### Dependencies
var debug = require('debug')('comm:init'),
    blowfish = require('./blowfish'),
    utils = require('./../util'),
    createBuffer = utils.createBuffer;

// ### Configuration
var config = require('./../config'),
    ROVER_PORT = config.ROVER_PORT,
    ROVER_HOST = config.ROVER_HOST,
    key = 'AC13:00E04C082DD6-save-private:AC13';

// ### Exports
// Initializes connection with rover 2.0
//
// * `callback`: function to deliver initialized socket to
module.exports = function (callback) {
    // Initialize blowfish
    blowfish.init(key, key.length);

    // Socket used to communicate
    var socket;

    // Counter to keep track of initialization step
    var counter = 0;

    // Container for data required to persist
    var imgData = new Buffer(4),
        validation = new Buffer(16);

    // Counter for step 5
    var count = 0;

    // Handlers for receiving data
    var handlers = {
        // Instruction 0
        0: function (data) {
            // Copy over rover challenge
            var meaningfulData = new Buffer(16);
            data.copy(meaningfulData, 0, 66, 82);
            debug('received challenge: ' + util.inspect(meaningfulData));

            // Pull out challenge numbers
            var num1 = utils.byteArrayToInt(meaningfulData, 0, 4),
                num2 = utils.byteArrayToInt(meaningfulData, 4, 4),
                num3 = utils.byteArrayToInt(meaningfulData, 8, 4),
                num4 = utils.byteArrayToInt(meaningfulData, 12, 4);

            // Encipher each pair
            var left = blowfish.encipher([num1], [num2]);
            var right = blowfish.encipher([num3], [num4]);

            // Write validation
            validation.writeInt32LE(left[0], 0);
            validation.writeInt32LE(left[1], 4);
            validation.writeInt32LE(right[0], 8);
            validation.writeInt32LE(right[1], 12);

            debug('sending challenge response: ' + util.inspect(validation));

            // Just send next instruction
            nextInstruction();
        },
        // Instruction 1
        1: function (data) {
            // Just send next instruction
            nextInstruction();
        },
        // Instruction 2
        2: function (data) {
            // Send next instruction
            var len = data.length;
            data.copy(imgData, 0, len - 4, len);
            console.log(util.inspect(data));
            debug('grabbed image data: ' + util.inspect(imgData));
            nextInstruction();
        },
        // Instruction 3
        3: function (data) {
            // Send next instruction
            nextInstruction();
        },
        // Instruction 5
        // Should receive two transmissions
        5: function (data) {
            // Increment count
            count++;

            // Check if finished
            if (count == 2) {
                // Initialization complete
                debug('initialization complete');

                // Remove all handlers
                socket.removeAllListeners();

                // Deliver validated socket
                callback(null, {socket: socket, imgData: imgData});
            }
        }
    };

    // Instructions for each step of intialization
    var instructions = {
        // Send login request
        0: function () { return createBuffer(39, { 15: 0x10, 25: 0x03, 25: 0xe8, 29: 0x07, 30: 0xd0, 31: 0xb8, 32: 0x0b, 35: 0xa0, 36: 0x0f }); },

        // Send challenge response
        1: function () { 
            // Create default options
            var options = { 4: 0x02, 15: 0x10 };

            // Write in validation
            for (var i = 0; i < 16; i++) {
                (function (index) {
                    options[i + 23] = validation[i];
                })(i);
            }

            // Return buffer
            return createBuffer(39, options);
        },

        // Request video key
        2: function () { return createBuffer(27, { 4: 0x04, 15: 0x04, 23: 0x01 })},

        // Tell rover to treat this socket as command socket
        3: function () { return createBuffer(24, { 4: 0x08, 15: 0x01, 23: 0x02 })},

        // Tell rover to keep socket alive
        4: function () { return createBuffer(23, { 4: 0xff })},

        // Batter request
        5: function () { return createBuffer(23, { 4: 0xfb })}
    };

    // Create socket
    debug('connecting to rover on ' + ROVER_HOST + ':' + ROVER_PORT);
    socket = net.createConnection(ROVER_PORT, ROVER_HOST);

    // Wait for socket to connect before writing data
    socket.on('connect', function () {
        debug('init socket created');
        // Send initial instruction
        debug('starting step 0');
        writeToSocket(socket, instructions[counter]());
    });

    // Response to data event on socket
    socket.on('data', function (data) {
        // Just forward callback to current handler
        if (handlers[counter]) handlers[counter](data);
    });

    // Watch for error
    socket.on('error', function (err) {
        debug('init error on step ' + counter + ': ' + util.inspect(err));
        callback(err);
    });

    // Watch for timeout
    socket.on('timeout', function () {
        debug('timeout on step ' + counter);
        callback('timeout');
    });

    // Watch for socket disconnection
    socket.on('close', function () {
        debug('init socket disconnected');
        callback('Connection closed unexpectedly');
    });


    // ### nextInstruction()
    // Sends next initialization instruction to rover.  Instruction counter will be incremented.
    function nextInstruction () {
        // Increment counter
        counter++;

        // Send command
        debug('starting step ' + counter);
        writeToSocket(socket, instructions[counter]());
    }

    // ### writeToSocket(socket, data)
    // Sends message to rover over provided TCP socket.  Data may be either a string or buffer.
    //
    // * `socket`: instance of net.Socket to write to
    // * `data`: string or buffer to write
    function writeToSocket (socket, data) {
        if (typeof data === 'string') {
            socket.write(data, 'utf8');
        } else {
            socket.write(data, 0);
        }
        if (!handlers[counter]) nextInstruction();
    }
};