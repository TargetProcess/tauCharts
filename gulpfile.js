const gulp = require('gulp');
const connect = require('gulp-connect');

const plugins = {connect};

require('./tasks/gulp-js')(gulp, plugins);
require('./tasks/gulp-css')(gulp, plugins);
require('./tasks/gulp-watch')(gulp, plugins);

gulp.task('build', [
    'build-js',
    'build-plugins-js',
    'build-css'
]);
