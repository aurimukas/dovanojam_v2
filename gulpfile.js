'use strict';

// #########################################################################
// #### IMPORTS ###########
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    fs = require('fs'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    gulpif = require('gulp-if'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCss = require('gulp-clean-css'),
    eslint = require('gulp-eslint'),
    vendor = require('gulp-concat-vendor'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    webpack = require('webpack');

var argv = require('minimist')(process.argv.slice(2)); // eslint-disable-line

// #########################################################################
// #### SETTINGS ###########
var options = {
    debug: argv.debug
};
var PROJECT_ROOT = __dirname + "/dovanojam/static";
var PROJECT_PATH = {
    js: PROJECT_ROOT + "/js",
    sass: PROJECT_ROOT + "/sass",
    css: PROJECT_ROOT + "/css",
    icons: PROJECT_ROOT + "/fonts",
    bower: PROJECT_ROOT + "/bower_components"
};
var PROJECT_PATTERNS = {
    js: [
        PROJECT_PATH.js + '/libs/*.js'
    ],
    sass: [
        PROJECT_PATH.sass + '/**/*.{scss,sass}'
    ],
    icons: [
        //PROJECT_PATH.bower + '/material-design-icons/sprites/svg-sprite/*.svg'
        PROJECT_PATH.bower + '/material-design-icons/action/svg/production/*.svg',
        PROJECT_PATH.bower + '/material-design-icons/alert/svg/production/*.svg',
        PROJECT_PATH.bower + '/material-design-icons/av/svg/production/*.svg'
    ]
};

var CMS_VERSION = fs.readFileSync('dovanojam/__init__.py', { encoding: 'utf-8' })
    .match(/__version__ = '(.*?)'/)[1];

// #########################################################################
// #### TASKS ###########
/**
 * @function cacheBuster
 * @param {Object} opts
 * @param {String} [opts.version]
 * @return {Function}
 */
var cacheBuster = function (opts) {
    var version = opts && opts.version ? opts.version : Math.random();

    return function (css) {
        css.replaceValues(/__VERSION__/g, { fast: '__VERSION__' }, function () {
            return version;
        });
    };
};

gulp.task('sass', function () {
    gulp.src(PROJECT_PATTERNS.sass)
        .pipe(gulpif(options.debug, sourcemaps.init()))
        .pipe(sass())
        .on('error', function (error) {
            gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.merssageFormatted));
        })
        .pipe(postcss([
            autoprefixer({
                cascade: false
            }),
            cacheBuster({
                version: CMS_VERSION
            })
        ]))
        .pipe(minifyCss({
            rebase: false
        }))
        .pipe(gulpif(options.debug, sourcemaps.write()))
        .pipe(gulp.dest(PROJECT_PATH.css));
});

gulp.task('lint', ['lint:javascript']);
gulp.task('lint:javascript', function () {
    return gulp.src(PROJECT_PATTERNS.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

var webpackBundle = function (opts) {
    var webpackOptions = opts || {};

    webpackOptions.PROJECT_PATH = PROJECT_PATH;
    webpackOptions.debug = options.debug;

    return function (done) {
        var config = require('./webpack.config')(webpackOptions);

        webpack(config, function (err, stats) {
            if (err) {
                throw new gutil.PluginError('webpack', err);
            }
            gutil.log('[webpack]', stats.toString({ colors: true }));
            if (typeof done !== 'undefined' && (!opts || !opts.watch)) {
                done();
            }
        });
    };
};

gulp.task('vendors', function() {
    // Main App Dependencies
    gulp.src([
        PROJECT_PATH.bower + '/jquery/dist/jquery.js',
        PROJECT_PATH.bower + '/Materialize/dist/js/materialize.js'
    ])
        .pipe(vendor('vendors.js'))
        .pipe(rename('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PROJECT_PATH.js + '/dist'));

    // File Upload Vendor
    gulp.src([
        PROJECT_PATH.bower + '/blueimp-tmpl/js/tmpl.min.js',
        PROJECT_PATH.bower + '/blueimp-load-image/js/load-image.all.min.js',
        PROJECT_PATH.bower + '/blueimp-canvas-to-blob/js/canvas-to-blob.min.js'
    ])
        .pipe(vendor('bundle.file-uploader-vendors.js'))
        .pipe(rename('bundle.file-uploader-vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PROJECT_PATH.js + '/dist'));

    gulp.src([
        PROJECT_PATH.bower + '/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.iframe-transport.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/cors/jquery.xdr-transport.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.fileupload.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.fileupload-process.js'
    ])
        .pipe(vendor('bundle.file-uploader-core.js'))
        .pipe(rename('bundle.file-uploader-core.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PROJECT_PATH.js + '/dist'));

    gulp.src([
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.fileupload-image.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.fileupload-validate.js',
        PROJECT_PATH.bower + '/blueimp-file-upload/js/jquery.fileupload-ui.js'
    ])
        .pipe(vendor('bundle.file-uploader-extra.js'))
        .pipe(rename('bundle.file-uploader-extra.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PROJECT_PATH.js + '/dist'));
});

gulp.task('jquery', function() {
    gulp.src([PROJECT_PATH.bower + '/jquery/dist/jquery.js'])
        .pipe(rename('jquery.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PROJECT_PATH.js + '/dist'));
});

gulp.task('bundle:watch', webpackBundle({ watch: true }));
gulp.task('bundle', webpackBundle());

gulp.task('watch', ['bundle:watch'], function () {
    gulp.watch(PROJECT_PATTERNS.sass, ['sass']);
    //gulp.watch(PROJECT_PATTERNS.js, ['lint']);
});

gulp.task('default', ['sass', 'lint', 'watch']);
