const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

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

module.exports = (gulp, {
    banner,
    concat,
    connect,
    insert,
    merge,
}) => {

    const getSrc = (name, isPlugin = false) => {
        return `./less${isPlugin ? '/plugins' : ''}/${name}.less`;
    };

    const getDestDir = ({isPlugin = false, production}) => {
        const root = (production ? 'dist' : 'debug');
        return `./${root}${isPlugin ? '/plugins' : ''}`;
    };

    const getDestFile = (name, theme, isPlugin = false) => {
        return `${name}${getThemePrefix(theme)}.css`;
    };

    const getThemePrefix = (theme) => {
        return (theme === 'default' || !theme ? '' : `.${theme}`);
    };

    const createStream = ({name, theme, isPlugin, production}) => {
        const src = getSrc(name, isPlugin);
        const destDir = getDestDir({isPlugin, production});
        const destFile = getDestFile(name, theme, isPlugin);
        var stream = gulp.src(src)
            .pipe(less({
                sourceMap: (production ? null : {
                    sourceMapFileInline: true,
                    outputSourceFiles: true
                }),
                paths: ['less'],
                modifyVars: {
                    theme
                }
            }))
            .pipe(rename(destFile));

        if (production) {
            stream = stream
                .pipe(insert.prepend(banner()))
        }

        return stream
            .pipe(gulp.dest(destDir));
    };

    const concatThemeStreams = (theme, streams) => {
        return merge(...streams)
            .pipe(concat(`taucharts${getThemePrefix(theme)}.min.css`))
            .pipe(cssmin())
            .pipe(insert.prepend(banner()))
            .pipe(gulp.dest(getDestDir({production: true})));
    };

    const buildCSS = ({production}) => {

        const brewerStream = createStream({
            name: 'colorbrewer',
            isPlugin: false,
            production
        });

        const streams = [brewerStream];

        themes.forEach((theme) => {

            const themeStreams = [];

            themeStreams.push(createStream({
                name: 'taucharts',
                theme,
                isPlugin: false,
                production
            }));

            plugins.forEach((plugin) => {
                themeStreams.push(createStream({
                    name: plugin,
                    theme,
                    isPlugin: true,
                    production
                }));
            });

            if (production) {
                let concatStream = concatThemeStreams(theme, themeStreams.concat(brewerStream));
                themeStreams.push(concatStream);
            }

            streams.push(...themeStreams);
        });

        const mergedStream = merge(streams);

        if (production) {
            return mergedStream;
        }

        return mergedStream
            .pipe(connect.reload());
    };

    gulp.task('prod-css', () => buildCSS({production: true}));
    gulp.task('debug-css', () => buildCSS({production: false}));
};
