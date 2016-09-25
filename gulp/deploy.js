var gulp = require('gulp');

var paths = gulp.paths;
var exec = require('child_process').exec;

var $ = require('gulp-load-plugins')();

gulp.task('deploy',['build'], function (cb) {
    exec('firebase deploy', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});
