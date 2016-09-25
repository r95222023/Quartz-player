'use strict';

var path = require('path');
var gulp = require('gulp');

var paths = gulp.paths;

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

gulp.task('scripts',['typescripts'], function () {
  return gulp.src([path.join(paths.src, '/app/**/*.js'), path.join(paths.tmp, '/app/**/*.js')])
    .pipe($.eslint())
    //.pipe($.eslint.format())
    .pipe($.size())
});
