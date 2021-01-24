const { resolve } = require('path');
const context = resolve(__dirname, 'src');
const main = resolve(__dirname, 'src', 'index.ts');
const outputPath = resolve(__dirname, 'build');
const filename = '[name].bundle.js';

module.exports = {
    context: context,
    entry: {
        main: main
    },
    output: {
        filename: filename,
        path: outputPath
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [
            context,
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'awesome-typescript-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    devtool: 'cheap-module-source-map'
};