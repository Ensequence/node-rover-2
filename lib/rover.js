/**
 * rover.js
 * Main rover control
 *
 * License: GPL
 */

// ### Dependencies
var init = require('./init'),
    commands = require('./commands');

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
})();