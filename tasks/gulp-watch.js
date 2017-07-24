const log = require('gulp-util').log;

module.exports = (gulp, {connect}) => {
    gulp.task('watch',
        [
            'debug-js',
            'debug-plugins-js',
            'debug-css'
        ],
        () => {
            const server = connect.server({
                host: '0.0.0.0',
                port: 9000,
                root: './',
                livereload: true,
                middleware: (connect, options) => {
                    log('Requests for `dist/` are redirected to `debug/`'.replace(/`([^`]*?)`/g, '\x1b[36m$1\x1b[0m'));
                    return [
                        connect().use('/dist', connect.static('./debug'))
                    ];
                }
            });
            gulp.watch(['src/**/*.js', 'src/**/*.ts'], ['debug-js']);
            gulp.watch('less/**/*.less', ['debug-css']);
            gulp.watch(['plugins/**/*.js', 'plugins/**/*.ts'], ['debug-plugins-js']);
        });
};
