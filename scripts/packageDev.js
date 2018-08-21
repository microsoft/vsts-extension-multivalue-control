var exec = require("child_process").exec;

// Load existing publisher
var manifest = require("../vss-extension.json");
var extensionId = manifest.id;

// Package extension
var command = `tfx extension create --overrides-file configs/dev.json --manifest-globs vss-extension.json --extension-id ${extensionId}-dev --no-prompt --rev-version`;
exec(command, function(err, stdout, stderr) {
    console.log(stderr);
    console.log(stdout);
    if (err) {
        console.error(err);
    }
});