const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const {
    VueLoaderPlugin
} = require('vue-loader');
const {
    version
} = require('./package.json');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var debug = process.env.NODE_ENV !== "production";

const config = {
    mode: process.env.NODE_ENV,
    context: __dirname + '/src',
    entry: {
        'background': './background.js',
        'popup/popup': './popup/popup.js'
            // 'tab/tab': './tab/tab.js',
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            // If using the runtime only build
            'vue$': 'vue/dist/vue.runtime.esm.js'
        }
    },
    module: {
        rules: [{
                test: /\.vue$/,
                loaders: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.sass$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
            },
            {
                test: /\.(png|jpg|gif|svg|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?emitFile=false',
                },
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin([{
                from: 'assets',
                to: 'assets',
                ignore: ['icon.xcf']
            },
            {
                from: 'popup/popup.html',
                to: 'popup/popup.html',
                transform: transformHtml
            },
            // { from: 'tab/tab.html', to: 'tab/tab.html', transform: transformHtml },
            {
                from: 'manifest.json',
                to: 'manifest.json',
                transform: (content) => {
                    const jsonContent = JSON.parse(content);
                    jsonContent.version = version;

                    if (config.mode === 'development') {
                        jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
                    }

                    return JSON.stringify(jsonContent, null, 2);
                },
            },
        ]),
        new WebpackShellPlugin({
            onBuildEnd: ['node scripts/remove-evals.js'],
        }),
    ],
};

if (config.mode === 'production') {
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new UglifyJSPlugin({
            uglifyOptions: {
                compress: {
                    drop_console: true,
                },
                output: {
                    comments: false,
                },
            },
            warningsFilter: (warning, source) => {
                if (/Dropping unreachable code/i.test(warning)) {
                    return true;
                }

                if (/filename\.js/i.test(source)) {
                    return true;
                }

                return false;
            },
        })
    ]);
}

if (process.env.HMR === 'true') {
    config.plugins = (config.plugins || []).concat([
        new ChromeExtensionReloader(),
    ]);
}

function transformHtml(content) {
    return ejs.render(content.toString(), {
        ...process.env,
    });
}

module.exports = config;
