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
    Blowfish = require('./third-party/blowfish');

// ### Configuration
var config = require('./config'),
    createBuffer = config.createBuffer,
    ROVER_PORT = config.ROVER_PORT,
    ROVER_HOST = config.ROVER_HOST,
    key = 'AC13:00E04C082DD6-save-private:AC13';

// ### Exports
// Initializes connection with rover 2.0
//
// * `callback`: function to initialized socket to
module.exports = function (callback) {
    // Create instance of blowfish
    var blowfish = new Blowfish(key);

    // Socket used to communicate
    var socket;

    // Counter to keep track of initialization step
    var counter = 0;

    // Container for data required to persist
    var imgData = new Buffer(4),
        validation = new Buffer(16);

    // Handlers for receiving data
    var handlers = {
        // Instruction 0
        0: function (data) {
            // Copy important piece of data to meaningfulData
            data.copy(meaningfulData, 0, 66, 82);

            // Create buffers to hold each piece
            var buf1 = new Buffer(4),
                buf2 = new Buffer(4),
                buf3 = new Buffer(4),
                buf4 = new Buffer(4);

            // Copy each piece
            meaningfulData.copy(buf1, 0, 0, 4);
            meaningfulData.copy(buf2, 0, 4, 8);
            meaningfulData.copy(buf3, 0, 8, 12);
            meaningfulData.copy(buf4, 0, 12, 16);

            // Encipher each pair
            var left = blowfish.encipher(buf1.readUInt32BE(0), buf2.readUInt32BE(0));
            var right = blowfish.encipher(buf3.readUInt32BE(0), buf4.readUInt32BE(0));

            // Write validation
            validation.writeUInt32BE(left[0], 0);
            validation.writeUInt32BE(left[1], 4);
            validation.writeUInt32BE(right[0], 8);
            validation.writeUInt32BE(right[1], 12);

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
            nextInstruction();
        },
        // Instruction 3
        3: function (data) {
            // Send next instruction
            nextInstruction();
        },
        // Instruction 5
        5: function (data) {
            // Initialization complete
            debug('initialization complete');
            callback(null, socket);
        }
    };

    // Instructions for each step of intialization
    var instructions = {
        0: function () { return createBuffer(39, { 15: 0x10, 25: 0x03, 25: 0xe8, 29: 0x07, 30: 0xd0, 31: 0xb8, 32: 0x0b, 35: 0xa0, 36: 0x0f }); },
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

            // return createBuffer(39, {
            //     4: 0x02, 15: 0x10, 23: 0xb3, 24: 0xa2, 25: 0xe8, 26: 0xdd, 27: 0xad, 28: 0xe4, 29: 0x8e, 30: 0x40,
            //     31: 0xa1, 32: 0x94, 33: 0xc6, 34: 0x62, 35: 0x08, 36: 0xeb, 37: 0x06, 38: 0x98
            // });
        },
        2: function () { return createBuffer(27, { 4: 0x04, 15: 0x04, 23: 0x01 })},
        3: function () { return createBuffer(24, { 4: 0x08, 15: 0x01, 23: 0x02 })},
        4: function () { return createBuffer(23, { 4: 0xff })},
        5: function () { return createBuffer(23, { 4: 0xfb })}
        // 0: function () { return createBuffer(23, {}); },
        // 1: function () { return createBuffer(49, { 4: 0x02, 15: 0x1a, 23: 0x41, 24: 0x43, 25: 0x31, 26: 0x33, 36: 0x41, 37: 0x43, 38: 0x31, 39: 0x33 }); },
        // 2: function () { return createBuffer(24, { 4: 0x04, 15: 0x01, 19: 0x01, 23: 0x02 }); },
        // 3: function () {
        //     // Build initial set of data
        //     var buf = createBuffer(27, { 15: 0x04, 19: 0x04 });

        //     // Add imgData
        //     for (var i = 0; i < 4; i++) {
        //         buf[i + 23] = imgData[i];
        //     }

        //     // Return buffer
        //     return buf;
        // }
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
        debug('data for step ' + counter + ': ' + util.inspect(data));
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

    // Watch for drain
    socket.on('drain', function () {
        debug('drain for step ' + counter);
    });

    // Watch for socket disconnection
    socket.on('close', function () {
        debug('init socket disconnected');
        callback('Connection closed unexpectedly', meaningfulData);
    });


    // ### nextInstruction()
    // Sends next initialization instruction to rover.  Instruction counter will be incremented.
    function nextInstruction () {
        // Increment counter
        counter++;

        // Send command
        debug('\nstarting step ' + counter);
        writeToSocket(socket, instructions[counter]());
    }

    // ### writeToSocket(socket, data)
    // Sends message to rover over provided TCP socket.  Data may be either a string or buffer.
    //
    // * `socket`: instance of net.Socket to write to
    // * `data`: string or buffer to write
    function writeToSocket (socket, data) {
        debug('writing for step ' + counter + ': ' + util.inspect(data));
        if (typeof data === 'string') {
            socket.write(data, 'utf8');
        } else {
            socket.write(data, 0);
        }
        if (!handlers[counter]) nextInstruction();
    }
};