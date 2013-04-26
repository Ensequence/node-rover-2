#!/usr/bin/env node

// create a local REPL to speed up development on usersaurus

var util = require('./util')
  , blowfish = require('./blowfish')
  , repl = require("repl")
  ;

//A "local" node repl with a custom prompt
var local = repl.start("rover> ");


local.context.util = util;
local.context.blow = blowfish;

local.context.er = function(err, result) { 
    if (err) console.log(err);
    if (result) console.log(result);
}