#!/usr/bin/env node

// create a local REPL to speed up development on usersaurus

var util = require('./lib/util')
  , blowfish = require('./lib/connect/blowfish')
  , rover = require('./lib/rover')
  , repl = require("repl")
  ;

//A "local" node repl with a custom prompt
var local = repl.start("rover> ");


local.context.utils = util;
local.context.blow = blowfish;
local.context.rover = rover;

local.context.er = function(err, result) { 
    if (err) console.log(err);
    if (result) console.log(result);
}