/**
 * Configuaration values for communicating with rover 2.0
 *
 * Author: Steven White
 * License: MIT
 */

// ### Exports
module.exports = {
    // Host to communicate with rover
    ROVER_HOST: '192.168.1.100',

    // Port to communicate with rover
    ROVER_PORT: 80,

    // Rover login information
    ROVER_USERNAME: 'AC13',
    ROVER_PASSWORD: 'AC13',

    // Build byte array to send to rover
    createBuffer: function (size, data) {
        // Create buffer of specified size
        var buf = new Buffer(size);

        // All instructions have similar beginning
        buf.write('MO_O');

        // Set other bytes based on provided data
        for (var i = 4; i < size; i++) {
            (function (index) {
                buf[index] = data[index] || 0x00;
            })(i);
        }

        // Deliver buffer
        return buf;
    }
};