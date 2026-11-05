"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var source = fs.readFileSync(path.join(__dirname, "../src/multivalue.html"));
var packaged = fs.readFileSync(path.join(__dirname, "../dist/multivalue.html"));

assert.ok(source.equals(packaged),
    "Packaged iframe HTML must match its source. HTML minimization can relocate the UTF-8 BOM into body text and cause clipping.");
console.log("Packaged iframe HTML matches its source.");