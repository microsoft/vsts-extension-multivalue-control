"use strict";

var exec = require("child_process").exec;

// Package extension
var command = `tfx extension create --overrides-file configs/release.json --manifest-globs vss-extension.json --no-prompt --json`;
exec(command, function(err, stdout, stderr) {
    console.log(stderr);
    console.log(stdout);
    if (err) {
        console.error(err);
    }
});