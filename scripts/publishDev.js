var exec = require("child_process").exec;

var manifest = require("../azure-devops-extension.json");
var extensionId = manifest.id;
var extensionPublisher = manifest.publisher;
var extensionVersion = manifest.version;

// Package extension
var command = `tfx extension publish --vsix ${extensionPublisher}.${extensionId}-dev-${extensionVersion}.vsix --no-prompt`;
exec(command, function() {
    console.log("Package published.");
});