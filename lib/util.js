/**
 * util.js
 * Provides utility methods for buffer / string manipulation
 *
 * License: GPU
 */

// ### Exports
module.exports = {

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