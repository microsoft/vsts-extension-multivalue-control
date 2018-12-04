var webpack = require("webpack");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          reportFilename: "bundle-analysis.html",
          analyzerMode: "static"
        })
    ]
}