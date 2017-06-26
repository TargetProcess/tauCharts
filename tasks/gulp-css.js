const less = require('gulp-less');
const rename = require('gulp-rename');
const eventStream = require('event-stream');

const main = 'taucharts';
const plugins = [
    'annotations',
    'crosshair',
    'export-to',
    'legend',
    'quick-filter',
    'tooltip',
    'trendline',
];
const themes = [
    'dark',
    'default'
];

module.exports = (gulp, {connect}) => {

    const getSrc = (name, isPlugin = false) => {
        return `./less${isPlugin ? '/plugins' : ''}/${name}.less`;
    };

    const getDestDir = ({isPlugin = false, production}) => {
        const root = (production ? 'dist' : 'debug');
        return `./${root}${isPlugin ? '/plugins' : ''}`;
    };

    const getDestFile = (name, theme, isPlugin = false) => {
        const themePrefix = (theme === 'default' ? '' : `.${theme}`);
        return `${name}${themePrefix}.css`;
    };

    const createStream = ({name, theme, isPlugin, production}) => {
        const src = getSrc(name, isPlugin);
        const destDir = getDestDir({isPlugin, production});
        const destFile = getDestFile(name, theme, isPlugin);
        return gulp.src(src)
            .pipe(less({
                paths: ['less'],
                modifyVars: {
                    theme
                }
            }))
            .pipe(rename(destFile))
            .pipe(gulp.dest(destDir));
    };

    const buildCSS = ({production}) => {
        const streams = [];
        themes.forEach((theme) => {
            streams.push(createStream({
                name: main,
                theme,
                isPlugin: false,
                production
            }));
            plugins.forEach((plugin) => {
                streams.push(createStream({
                    name: plugin,
                    theme,
                    isPlugin: true,
                    production
                }));
            });
        });
        return eventStream
            .merge(streams)
            .pipe(connect.reload());
    };

    gulp.task('build-css', () => buildCSS({production: true}));
    gulp.task('debug-css', () => buildCSS({production: false}));
};
