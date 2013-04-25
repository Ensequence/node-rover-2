/**
 * Handles initialization of communication with rover 2.0
 *
 * Author: Steven White
 * License: MIT
 */

// ### Core Modules
var net = require('net');

// ### Dependencies
var config = require('./config'),
    createBuffer = config.createBuffer,
    ROVER_PORT = config.ROVER_PORT,
    ROVER_HOST = config.ROVER_HOST;

// ### Exports
// Initializes connection with rover 2.0
//
// * `callback`: function to initialized socket to
module.exports = function (callback) {
    // Socket used to communicate
    var socket;

    // Counter to keep track of initialization step
    var counter = 0;

    // Container for data required to persist
    var imgData = new Buffer(4);

    // Handlers for receiving data
    var handlers = {
        // Instruction 0
        0: function (data) {
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
            // Capture imgData
            for (var i = 0; i < 4; i++) {
                imgData[i] = data[i + 25];
            }

            // Send next instruction
            nextInstruction();
        },
        // Instruction 3
        3: function (data) {
            // Initialization complete
            // Deliver socket to execute commands on
            callback(null, socket);
        }
    };

    // Instructions for each step of intialization
    var instructions = {
        0: function () { return createBuffer(23, {}); },
        1: function () { return createBuffer(49, { 4: 0x02, 15: 0x1a, 23: 0x41, 24: 0x43, 25: 0x31, 26: 0x33, 36: 0x41, 37: 0x43, 38: 0x31, 39: 0x33 }); },
        2: function () { return createBuffer(24, { 4: 0x04, 15: 0x01, 19: 0x01, 23: 0x02 }); },
        3: function () {
            // Build initizl set of data
            var buf = createBuffer(27, { 15: 0x04, 19: 0x04 });

            // Add imgData
            for (var i = 0; i < 4; i++) {
                buf[i + 23] = imgData[i];
            }

            // Return buffer
            return buf;
        }
    };

    // Create socket
    socket = net.createConnection(ROVER_PORT, ROVER_HOST);

    // Wait for socket to connect before writing data
    socket.on('connect', function () {
        // Send initial instruction
        sendCmd(socket, instructions[counter]());
    });

    // Response to data event on socket
    socket.on('data', function (data) {
        // Just forward callback to current handler
        handlers[counter](data);
    });

    // Watch for error
    socket.on('error', function (err) {
        console.log('err: ', err);
        callback(err);
    });

    // Watch for socket disconnection
    socket.on('end', function () {
        console.log('disconnected');
        callback('Connection closed unexpectedly');
    });


    // ### nextInstruction()
    // Sends next initialization instruction to rover.  Instruction counter will be incremented.
    function nextInstruction () {
        // Increment counter
        counter++;

        // Send command
        sendCmd(socket, instructions[counter]());
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
    }
};