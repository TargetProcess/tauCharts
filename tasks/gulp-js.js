const rollup = require('rollup-stream');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const log = require('gulp-util').log;
const red = (message) => `\x1b[31m${message}\x1b[0m`;
const fs = require('fs');

const tsConfig = {
    typescript: require('typescript'),
    module: 'es2015',
    lib: [
        'es6',
        'dom'
    ],
    allowJs: true,
    target: 'es5',
    baseUrl: '.',
    paths: {
        'taucharts': [
            'src/tau.charts'
        ]
    },
    include: [
        'plugins/**/*',
        'src/**/*',
        'test/**/*'
    ],
    exclude: [
        'bower_components',
        'node_modules'
    ]
};

const d3Modules = [
    'd3-array',
    'd3-axis',
    'd3-brush',
    'd3-color',
    'd3-format',
    'd3-geo',
    'd3-request',
    'd3-scale',
    'd3-selection',
    'd3-shape',
    'd3-time',
    'd3-time-format',
    'd3-transition',
    'd3-quadtree',
];

const d3Globals = d3Modules.reduce((map, d3Module) => {
    map[d3Module] = 'd3';
    return map;
}, {});

const mainConfig = {
    entry: './src/tau.charts.ts',
    moduleId: 'taucharts',
    moduleName: 'Taucharts',
    exports: 'default',
    format: 'umd',
    useStrict: true,
    external: [
        ...d3Modules,
        'topojson-client'
    ],
    globals: Object.assign({}, d3Globals, {
        'topojson-client': 'topojson'
    }),
    plugins: [
        require('rollup-plugin-alias')({
            'tau-tooltip': 'node_modules/tau-tooltip/src/tooltip.js'
        }),
        require('rollup-plugin-replace')({
            '{{VERSION}}': `${require('../package.json').version}`
        }),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')(),
        require('@alexlur/rollup-plugin-typescript')(tsConfig)
    ]
};

const pluginsCommonConfig = {
    exports: 'default',
    format: 'umd',
    useStrict: true,
    external: [
        ...d3Modules,
        'taucharts'
    ],
    globals: Object.assign({}, d3Globals, {
        'taucharts': 'Taucharts'
    }),
    plugins: [
        require('rollup-plugin-commonjs')(),
        require('@alexlur/rollup-plugin-typescript')(tsConfig)
    ]
};

const plugins = [
    'annotations',
    'bar-as-span',
    'box-whiskers',
    'crosshair',
    ['export-to', {
        onwarn: function (warning) {
            // Note: 'fetch' causes a warning.
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
            console.error(warning.message);
        },
        plugins: [
            require('rollup-plugin-string')({
                include: 'plugins/**/*.css'
            }),
            require('rollup-plugin-alias')({
                'rgbcolor': 'bower_components/canvg/rgbcolor.js',
                'stackblur': 'bower_components/canvg/StackBlur.js',
                'canvg': 'bower_components/canvg/canvg.js',
                'file-saver': 'bower_components/file-saver/FileSaver.js',
                'fetch': 'bower_components/fetch/fetch.js',
                'es6-promise': 'bower_components/es6-promise/es6-promise.js'
            })
        ].concat(pluginsCommonConfig.plugins)
    }],
    'floating-axes',
    'geomap-legend',
    'geomap-tooltip',
    'layers',
    'legend',
    'parallel-brushing',
    'parallel-tooltip',
    'quick-filter',
    'settings',
    'tooltip',
    'trendline',
];

const cache = {};

module.exports = (gulp, {
    banner,
    concat,
    connect,
    insert,
    merge,
    runSequence,
}) => {

    const createStream = ({distDir, distFile, rollupConfig, production}) => {

        const {entry} = rollupConfig;
        const config = Object.assign(
            {},
            rollupConfig,
            {rollup: require('rollup')},
            (production ?
                {
                    sourceMap: false
                } :
                {
                    cache: cache[entry],
                    sourceMap: true
                })
        );

        var stream = rollup(config);
        if (!production) {
            stream = stream
                .on('bundle', (bundle) => cache[entry] = bundle)
                .on('error', function (err) {
                    cache[entry] = null;
                    log(red([
                        '',
                        '.========================.',
                        '!                        !',
                        '! JAVASCRIPT BUILD ERROR !',
                        '!                        !',
                        '*========================*'
                    ].join('\n')));
                    log(err);
                    this.emit('end');
                });
        }
        stream = stream
            .pipe(source(distFile));

        if (production) {
            stream = stream
                .pipe(streamify(insert.prepend(banner())));
        }

        return stream
            .pipe(gulp.dest(distDir));
    };

    const getRoot = ({production}) => {
        return (production ? 'dist' : 'debug');
    };

    const buildMainJS = ({production}) => {

        const stream = createStream({
            distDir: `./${getRoot({production})}`,
            distFile: 'taucharts.js',
            rollupConfig: mainConfig,
            production
        });

        return stream
            .pipe(connect.reload());
    };

    const buildPluginsJS = ({production}) => {

        const streams = plugins.map((p) => {
            const [plugin, pluginConfig] = (Array.isArray(p) ? p : [p, {}]);
            const jsPath = `./plugins/${plugin}.js`;
            const tsPath = `./plugins/${plugin}.ts`;
            return createStream({
                distDir: `./${getRoot({production})}/plugins`,
                distFile: `${plugin}.js`,
                rollupConfig: Object.assign(
                    {},
                    pluginsCommonConfig,
                    pluginConfig,
                    {
                        entry: (fs.existsSync(jsPath) ? jsPath : tsPath),
                        moduleId: `taucharts-${plugin}`,
                        moduleName: `taucharts${spinalCaseToCamelCase(plugin)}`
                    }
                ),
                production
            });
        });

        const mergedStream = merge(...streams);

        if (production) {
            return mergedStream;
        }

        return mergedStream
            .pipe(connect.reload());
    };

    const minifyJS = () => {

        const root = getRoot({production: true});
        const sources = [`./${root}/taucharts.js`]
            .concat(plugins.map((plugin) => `./${root}/plugins/${plugin}.js`));

        return gulp.src(sources)
            .pipe(streamify(concat('taucharts.min.js')))
            .pipe(streamify(uglify().on('error', function (err) {
                log(red([
                    '',
                    '.=======================.',
                    '!                       !',
                    '! UGLIFY JS BUILD ERROR !',
                    '!                       !',
                    '*=======================*'
                ].join('\n')));
                log(err);
                this.emit('end');
            })))
            .pipe(streamify(insert.prepend(banner())))
            .pipe(gulp.dest(`./${root}`));
    };

    gulp.task('prod-js_compile', () => merge(
        buildMainJS({production: true}),
        buildPluginsJS({production: true})
    ));
    gulp.task('prod-js_minify', () => minifyJS());
    gulp.task('prod-js', (done) => runSequence(
        'prod-js_compile',
        'prod-js_minify',
        done));
    gulp.task('debug-js', () => buildMainJS({production: false}));
    gulp.task('debug-plugins-js', () => buildPluginsJS({production: false}));
};

function spinalCaseToCamelCase(spinal) {
    return spinal
        .split('-')
        .map((s) => s.slice(0, 1).toUpperCase() + s.slice(1))
        .join('');
}
