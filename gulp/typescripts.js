'use strict';

var path = require('path');
var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('typescripts', function () {
    var tsResult = gulp.src(paths.src+'/**/*.ts')
        .pipe($.typescript({
            sortOutput: true
        }));
    return tsResult.js
        .pipe(gulp.dest(paths.tmp + '/serve/'));
});
