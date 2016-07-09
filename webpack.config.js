var webpack = require('webpack');

module.exports = function (opts) {
    'use strict';

    var PROJECT_PATH = opts.PROJECT_PATH;
    var debug = opts.debug;

    var baseConfig = {
        devtool: false,
        watch: !!opts.watch,
        entry: {
            'app': PROJECT_PATH.js + '/app.js',
        },
        output: {
            path: PROJECT_PATH.js + '/dist/',
            filename: 'bundle.[name].min.js'
        },
        plugins: [
            new webpack.ProvidePlugin({
                "windows.jQuery": "jquery"
            })
        ],
        resolve: {
            alias: {
                'jquery': PROJECT_PATH.js + '/dist/jquery.min.js'
            },
            extensions: ['', '.js', '.jsx'],
            modulesDirectories: [
                PROJECT_PATH.bower + '/blueimp-file-upload/js/vendor',
                PROJECT_PATH.bower + '/blueimp-tmpl/js',
                'node_modules',
                PROJECT_PATH.bower,
                PROJECT_PATH.bower + '/blueimp-file-upload/js',
                PROJECT_PATH.bower + '/blueimp-file-upload/js/vendor',
                PROJECT_PATH.bower + '/blueimp-canvas-to-blob/js',
                PROJECT_PATH.bower + '/blueimp-load-image/js',
                PROJECT_PATH.bower + '/blueimp-tmpl/js',
                PROJECT_PATH.bower + '/blueimp-load-image/js/vendor'
            ]
        },
        module: {

        }
    };

    if (debug) {
        baseConfig.devtool = 'inline-source-map';
        baseConfig.plugins = baseConfig.plugins.concat([
            new webpack.NoErrorsPlugin(),
            new webpack.DefinePlugin({
                __DEV__: 'true'
            })
        ]);
    } else {
        baseConfig.plugins = baseConfig.plugins.concat([
            new webpack.DefinePlugin({
                __DEV__: 'true'
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                comments: false,
                compressor: {
                    drop_console: true // eslint-disable-line
                }
            })
        ]);
    }

    return baseConfig;
};
