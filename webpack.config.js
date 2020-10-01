const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require("path");

const absPath = relPath => path.resolve(__dirname, relPath);

const VERSION = require("./package.json").version;

const template = process.env.TEMPLATE && process.env.TEMPLATE.length > 0 ? process.env.TEMPLATE : "index-template-tf.ejs";

const common = {
    mode: process.env.NODE_ENV,
    output: {
        path: path.resolve(__dirname, process.env.DIST_FOLDER),
        filename: '[name].[hash].bundle.js'
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
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
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
        new CopyWebpackPlugin({
            patterns: [
                { from: 'datasets', to: 'datasets' },
            ],
        }),
        new VueLoaderPlugin(),
    ],
    devServer: {
        contentBase: path.join(__dirname, process.env.DIST_FOLDER),
        compress: true,
        port: 9000
    }
}

const standard = {
    entry: {
        [process.env.BUNDLE_NAME]: `./src/${process.env.INDEX_TS}`,
    },
    ...common,
    plugins: [
        ...common.plugins,
        new HtmlWebpackPlugin({
            filename: "index.html",
            favicon: "./favicon.png",
            inject: true,
            templateParameters: { version: VERSION },
            template,
            chunks: [process.env.BUNDLE_NAME],
        }),
        new MiniCssExtractPlugin({
            filename: `${process.env.BUNDLE_NAME}.[hash].css`,
        }),
    ]
}

const buefied = {
    entry: {
        dnnCreatorBuefy: './src/dnnCreator/indexBuefy.ts'
    },
    ...common,
    plugins: [
        ...common.plugins,
        new HtmlWebpackPlugin({
            filename: "indexBuefy.html",
            favicon: "./favicon.png",
            inject: true,
            templateParameters: { version: VERSION },
            template: "index-template-buefy.ejs",
            chunks: ['dnnCreatorBuefy'],
        }),
        new MiniCssExtractPlugin({
            filename: `dnnCreatorBuefy.[hash].css`,
        }),
    ]
}

module.exports = [standard, buefied]