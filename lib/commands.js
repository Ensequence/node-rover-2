/**
 * command.js
 * Instruction set for commands
 *
 * License: GPL
 */

// ### Dependencies
var utils = require('./util');

// ### Exports
module.exports = {
    LEFT_FORWARD: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 19: 0x01, 23: 0x04, 24: 0x0a }); },
    LEFT_REVERSE: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 19: 0x01, 23: 0x05, 24: 0x0a }); },
    RIGHT_FORWARD: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 19: 0x01, 23: 0x01, 24: 0x0a }); },
    RIGHT_REVERSE: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 19: 0x01, 23: 0x02, 24: 0x0a }); },
    CAMERA_UP: function () { return utils.createBuffer(24, { 4: 0x0e, 15: 0x01 }); },
    CAMERA_STOP: function () { return utils.createBuffer(24, { 4: 0x0e, 15: 0x01, 23: 0x01 }); },
    CAMERA_DOWN: function () { return utils.createBuffer(24, { 4: 0x0e, 15: 0x01, 23: 0x02 }); },
    LIGHTS_ON: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 0x23: 0x08 })},
    LIGHTS_OFF: function () { return utils.createBuffer(25, { 4: 0xfa, 15: 0x02, 0x23: 0x09 })}
};