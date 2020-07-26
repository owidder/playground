const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

const absPath = relPath => path.resolve(__dirname, relPath);

const template = process.env.TEMPLATE && process.env.TEMPLATE.length > 0 ? process.env.TEMPLATE : "index-template-tf.html";

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        [process.env.BUNDLE_NAME]: `./src/${process.env.INDEX_TS}`
    },
    output: {
        path: path.resolve(__dirname, process.env.DIST_FOLDER)
    },
    devtool: 'source-map',
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: absPath("src"),
            },
            {
                oneOf: [
                    {
                        test: /\.ts$/,
                        include: absPath("src"),
                        use: [{
                            loader: 'awesome-typescript-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                                configFile: 'tsconfigTf.json'
                            }
                        }],
                    },
                    {
                        test: /\.scss$/,
                        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader", "sass-loader"]
                    },
                    {
                        test: /\.css$/,
                        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"]
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            favicon: "./favicon.png",
            inject: true,
            template,
        }),
        new MiniCssExtractPlugin({
            filename: `${process.env.BUNDLE_NAME}.css`,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'datasets', to: 'datasets' },
            ],
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, process.env.DIST_FOLDER),
        compress: true,
        port: 9000
    }
}
