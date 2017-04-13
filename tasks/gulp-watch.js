const rollup = require('rollup');

module.exports = (gulp, { connect }) => {
    gulp.task('watch',
        [
            'build-js',
            'build-plugins-js',
            'build-css'
        ],
        () => {
            var server = connect.server({
                host: '0.0.0.0',
                port: 9000,
                root: './',
                livereload: true
            });
            gulp.watch('src/**/*.js', ['build-js']);
            gulp.watch('less/**/*.less', ['build-css']);
            gulp.watch('plugins/**/*.js', ['build-plugins-js']);
        });
};
