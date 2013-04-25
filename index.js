/**
 * Entry point into node-rover
 *
 * Author: Steven White
 * License: MIT
 */

// ### Dependencies
var config = require('./lib/config'),
    init = require('./lib/init');

// ### Exports
module.exports = (function () {
    // ### connect(cb)
    // Establishes connection with rover 2.0
    //
    // * `cb`: function to deliver socket to upon successful connection
    function connect (cb) {
        init(cb);
    }

    // Expose methods
    return {
        connect: connect
    };
});