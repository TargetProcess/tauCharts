const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

const plugins = [
    'annotations',
    'category-filter',
    'crosshair',
    'diff-tooltip',
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
    runSequence,
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
                .pipe(insert.prepend(banner()));
        }

        return stream
            .pipe(gulp.dest(destDir));
    };

    const concatTheme = (theme) => {

        const root = getDestDir({production: true, isPlugin: false});
        const pluginsDir = getDestDir({production: true, isPlugin: true});
        const sources = [`./${root}/${getDestFile('taucharts', theme)}`]
            .concat(plugins.map((plugin) => `./${pluginsDir}/${getDestFile(plugin, theme)}`))
            .concat(`./${root}/${getDestFile('colorbrewer')}`);

        return gulp.src(sources)
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

            streams.push(createStream({
                name: 'taucharts',
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

        const mergedStream = merge(...streams);

        if (production) {
            return mergedStream;
        }

        return mergedStream
            .pipe(connect.reload());
    };

    const minifyCSS = () => {
        return merge(...themes.map(concatTheme));
    };

    gulp.task('prod-css_compile', () => buildCSS({production: true}));
    gulp.task('prod-css_minify', () => minifyCSS());
    gulp.task('prod-css', (done) => runSequence(
        'prod-css_compile',
        'prod-css_minify',
        done));
    gulp.task('debug-css', () => buildCSS({production: false}));
};
