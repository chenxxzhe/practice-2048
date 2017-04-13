const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
    devtool: 'eval-source-map',
    context: path.resolve(__dirname, '.'),
    entry: path.resolve(__dirname, './app/main.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name]-[hash].js',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'less-loader'],
                }),
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    // resolve: {
    //     extensions: ['.js']
    // },
    performance: {},
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'app/index.html'),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({
            filename: '[name]-[contenthash].css',
        }),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        historyApiFallback: true,
        inline: true,
        // hot: true,
        // 开了这个就只能在更改JS后才能自动刷新，不能刷CSS
        port: 9000,
    },
};
