'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;

gulp.task('inject', ['styles', 'typescripts'], function () {

    var injectStyles = gulp.src([
        paths.tmp + '/serve/app/**/*.css',
        '!' + paths.tmp + '/serve/app/vendor.css'
    ], {read: false});

    // var injectCore = gulp.src([
    //     paths.src + '/app/core/**/*.js',
    //     '!' + paths.src + '/app/core/**/*.spec.js',
    //     '!' + paths.src + '/app/core/**/*.mock.js'
    // ]);

    var injectScripts = gulp.src([
        paths.src + '/app/**/*.js',
        paths.tmp + '/serve/**/*.js',
        '!'+paths.src + '/app/core/**/*.js',
        '!'+paths.src + '/app/presets/**/*.js',
        '!' + paths.src + '/app/**/*.spec.js',
        '!' + paths.src + '/app/**/*.mock.js'
    ]).pipe($.angularFilesort());

    var injectOptions = {
        ignorePath: [paths.src, paths.tmp + '/serve'],
        addRootSlash: false
    };
    var injectCoreOptions = {
        starttag: '<!-- inject:core -->',
        ignorePath: [paths.src, paths.tmp + '/serve'],
        addRootSlash: false
    };

    var wiredepOptions = {
        directory: 'bower_components',
        exclude: [/bootstrap\.css/, /foundation\.css/, /material-design-iconic-font\.css/, /default\.css/]
    };

    return gulp.src(paths.src + '/*.html')
        .pipe($.inject(injectStyles, injectOptions))
        .pipe($.inject(injectScripts, injectOptions))
        .pipe($.inject(gulp.src(paths.src + '/app/core/**/*.js', {read: false}), injectCoreOptions))
        .pipe(wiredep(wiredepOptions))
        .pipe(gulp.dest(paths.tmp + '/serve'));

});
