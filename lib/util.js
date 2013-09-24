/**
 * util.js
 * Provides utility methods for buffer / string manipulation
 *
 * License: GPL
 */

// ### Exports
module.exports = {

    // ### createBuffer
    // Creates a buffer of length `size` with provided data
    //
    // * `size`: length of buffer
    // * `data`: data to add into buffer
    createBuffer: function (size, data) {
        // Create buffer of specified size
        var buf = new Buffer(size);
        buf.fill(0x00);

        // All instructions have similar beginning
        buf.write('MO_O');

        // Set other bytes based on provided data
        for (var i in data) {
            (function (index) {
                buf[index] = data[index];
            })(i);
        }

        // Deliver buffer
        return buf;
    },

    // ### stringToHex
    // Converts provided string to buffer
    //
    // * `str`: string to encode
    stringToHex: function (str) {
        var hex = new Buffer(str.length);
        hex.write(str);
        return hex;
    },

    // ### byteArrayToInt
    // Converts portion of byte array to integer
    //
    // * `bytes`: buffer containing data to create integer
    // * `start`: offset into buffer
    // * `len`: number of bytes to read into integer
    byteArrayToInt: function (bytes, start, len) {
        var i = 0;
        for (var j = 0; j < len; j++) {
            if ((j == 0) && (bytes[(start + (len - 1) - j)] < 0)) {
                i |= 0xFFFFFFFF & bytes[(start + (len - 1) - j)];
            } else {
                i |= 0xFF & bytes[(start + (len - 1) - j)];
            }
            if (j < len - 1) {
                i <<= 8;
            }
        }
        return i;
    },

    // ### int32ToByteArray
    // Transforms integer into byte array
    //
    // * `val`: value to create array from from
    int32ToByteArray: function (val) {
        var arrayOfByte = new Buffer(4);
        for (var i = 0; i < 4; i++) {
            arrayOfByte[i] = ((0xFF & val >>> i * 8));
        }
        return arrayOfByte;
    }
};