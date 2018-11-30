var path = require("path");
var webpack = require("webpack");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: "web",
    entry: {
        multivalue: "./src/multivalue.ts",
    },
    output: {
        chunkFilename: "src/[name]_chunk.js",
        filename: "src/[name].js",
        libraryTarget: "amd"
    },
    externals: [
        {
            react: true,
            "react-dom": true
        },
        /^VSS\/.*/, /^TFS\/.*/, /^q$/
    ],
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        moduleExtensions: ["-loader"],
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.s?css$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },
    mode: "development",
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 3
        }),
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          reportFilename: "bundle-analysis.html",
          analyzerMode: "static"
        }),
        new CopyWebpackPlugin([
            { from: "./node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js", to: "libs/VSS.SDK.min.js" },
            { from: "./src/multivalue.html", to: "./" },
            { from: "./img", to: "img" },
            { from: "./readme.md", to: "readme.md" }
        ])
    ]
}