const less = require('gulp-less');
const rename = require('gulp-rename');
const eventStream = require('event-stream');

const main = 'tauCharts';
const plugins = [
    'annotations',
    'crosshair',
    'export',
    'legend',
    'tooltip',
    'trendline',
    'quick-filter'
];
const themes = [
    'dark',
    'default'
];

module.exports = (gulp, {connect}) => {

    const getSrc = (name, isPlugin = false) => {
        return `./less${isPlugin ? '/plugins' : ''}/${name}.less`;
    };

    const getDestDir = (isPlugin = false) => {
        return `./dist${isPlugin ? '/plugins' : ''}`;
    };

    const getDestFile = (name, theme, isPlugin = false) => {
        const themePrefix = (theme === 'default' ? '' : `.${theme}`);
        return `${isPlugin ? 'tauCharts.' : ''}${name}${themePrefix}.css`;
    };

    const createStream = ({name, theme, isPlugin}) => {
        const src = getSrc(name, isPlugin);
        const destDir = getDestDir(isPlugin);
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

    gulp.task('build-css', () => {
        const streams = [];
        themes.forEach((theme) => {
            streams.push(createStream({
                name: main,
                theme,
                isPlugin: false
            }));
            plugins.forEach((plugin) => {
                streams.push(createStream({
                    name: plugin,
                    theme,
                    isPlugin: true
                }));
            });
        });
        return eventStream
            .merge(streams)
            .pipe(connect.reload());
    });
};
