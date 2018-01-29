const gulp = require('gulp');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const insert = require('gulp-insert');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');

const args = require('minimist')(process.argv.slice(2));

const banner = () => {
    const package = require('./package.json');
    const now = new Date();
    const today = require('d3-time-format').utcFormat('%Y-%m-%d')(now);
    const year = now.getUTCFullYear();
    return [
        `/*`,
        `${package.name}@${package.version} (${today})`,
        `Copyright ${year} ${package.author.name}`,
        `Licensed under ${package.licenses.map(x => x.type).join(', ')}`,
        `*/`,
        ``
    ].join('\n');
};

const plugins = {
    args,
    banner,
    concat,
    connect,
    insert,
    merge,
    rename,
    runSequence,
};

require('./tasks/gulp-js')(gulp, plugins);
require('./tasks/gulp-css')(gulp, plugins);
require('./tasks/gulp-watch')(gulp, plugins);

gulp.task('clean-dist', () => {
    return gulp.src('./dist')
        .pipe(clean());
});

gulp.task('build', (callback) => {
    runSequence('clean-dist', [
        'prod-js',
        'prod-css',
    ], callback);
});
