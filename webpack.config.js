var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: "web",
    entry: {
        app: "./src/app.ts"
    },
    output: {
        filename: "src/[name].js",
        libraryTarget: "amd"
    },
    externals: [
        /^VSS\/.*/, /^TFS\/.*/, /^q$/
    ],
    resolve: {
        extensions: [
            "",
            ".webpack.js",
            ".web.js",
            ".ts",
            ".tsx",
            ".js"],
        root: [
            path.resolve("./")
        ]
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.s?css$/,
                loaders: ["style", "css"]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "./node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js", to: "libs/VSS.SDK.min.js" },
            { from: "./src/index.html", to: "./" },
            { from: "./src/multi-selection.css", to: "./" },
            { from: "./img", to: "img" },
            { from: "./readme.md", to: "readme.md" }
        ])
    ]
}