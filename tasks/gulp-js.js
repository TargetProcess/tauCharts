const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const eventStream = require('event-stream');

const tsConfig = {
    typescript: require('typescript'),
    target: 'es5',
    allowJs: true,
    lib: [
        'es6',
        'dom'
    ],
    include: [
        '**/*.ts',
        '**/*.js'
    ],
    exclude: [
        'node_modules/**',
        'bower_components/**'
    ]
};

const mainConfig = {
    entry: './src/tau.charts.ts',
    moduleId: 'taucharts',
    moduleName: 'Taucharts',
    exports: 'default',
    format: 'umd',
    useStrict: true,
    external: [
        'd3',
        'topojson'
    ],
    globals: {
        'd3': 'd3',
        'topojson': 'topojson'
    },
    plugins: [
        require('rollup-plugin-alias')({
            'tau-tooltip': 'node_modules/tau-tooltip/src/tooltip.js'
        }),
        require('rollup-plugin-replace')({
            '{{VERSION}}': `${require('../package.json').version}`
        }),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-typescript')(tsConfig)
    ]
};

const pluginsCommonConfig = {
    exports: 'default',
    format: 'umd',
    useStrict: true,
    external: [
        'd3',
        'taucharts'
    ],
    globals: {
        'd3': 'd3',
        'taucharts': 'Taucharts'
    },
    plugins: [
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-typescript')(tsConfig)
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

module.exports = (gulp, {connect}) => {

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
                    console.error('\x1b[31m', [
                        '',
                        '.========================.',
                        '!                        !',
                        '! JAVASCRIPT BUILD ERROR !',
                        '!                        !',
                        '*========================*'
                    ].join('\n'));
                    console.error('\x1b[0m', err);
                    this.emit('end');
                });
        }
        return stream
            .pipe(source(distFile))
            .pipe(gulp.dest(distDir));
    };

    gulp.task('build-js', () => {

        return createStream({
            distDir: './dist',
            distFile: 'taucharts.js',
            rollupConfig: mainConfig,
            production: false
        }).pipe(connect.reload());

    });

    gulp.task('build-plugins-js', () => {

        const streams = plugins.map((p) => {
            const [plugin, pluginConfig] = (Array.isArray(p) ? p : [p, {}]);
            return createStream({
                distDir: './dist/plugins',
                distFile: `${plugin}.js`,
                rollupConfig: Object.assign(
                    {},
                    pluginsCommonConfig,
                    pluginConfig,
                    {
                        entry: `./plugins/${plugin}.js`,
                        moduleId: `taucharts-${plugin}`,
                        moduleName: `taucharts${spinalCaseToCamelCase(plugin)}`
                    }
                ),
                production: false
            });
        });

        return eventStream
            .merge(streams)
            .pipe(connect.reload());

    });
};

function spinalCaseToCamelCase(spinal) {
    return spinal
        .split('-')
        .map((s) => s.slice(0, 1).toUpperCase() + s.slice(1))
        .join('');
}
