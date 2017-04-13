const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const eventStream = require('event-stream');

const babelConfig = {
    presets: [
        ['es2015', {
            modules: false
        }]
    ],
    plugins: [
        'external-helpers'
    ]
};

const mainConfig = {
    entry: './src/tau.charts.js',
    moduleId: 'taucharts',
    moduleName: 'tauCharts',
    exports: 'default',
    format: 'umd',
    useStrict: false,
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
            VERSION: `'${require('../package.json').version}'`
        }),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-babel')(babelConfig)
    ]
};

const pluginsCommonConfig = {
    exports: 'none',
    format: 'umd',
    useStrict: false,
    external: [
        'taucharts'
    ],
    globals: {
        'taucharts': 'tauCharts'
    },
    plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-babel')(babelConfig)
    ]
};

const plugins = [
    'annotations',
    'box-whiskers',
    'crosshair',
    // ['export', {
    //     plugins: pluginsCommonConfig.plugins.concat(
    //         require('rollup-plugin-alias')({
    //             'print.style.css': 'plugins/print.style.css',
    //             'rgbcolor': 'bower_components/canvg/rgbcolor.js',
    //             'stackblur': 'bower_components/canvg/StackBlur.js',
    //             'canvg': 'bower_components/canvg/canvg.js',
    //             'FileSaver': 'bower_components/FileSaver.js/FileSaver.js',
    //             'fetch': 'bower_components/fetch/fetch.js',
    //             'promise': 'bower_components/es6-promise/promise.js'
    //         })
    //     )
    // }],
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
    'trendline'
];

const cache = {};

module.exports = (gulp, { connect }) => {

    const createStream = ({ distDir, distFile, rollupConfig, production }) => {

        const { entry } = rollupConfig;
        const config = Object.assign(
            {},
            rollupConfig,
            { rollup: require('rollup') },
            (production ?
                {
                    sourceMap: false
                } :
                {
                    cache: cache[entry],
                    sourceMap: 'inline'
                })
        );

        return rollup(config)
            .on('bundle', (bundle) => cache[entry] = bundle)
            .pipe(source(distFile))
            .pipe(gulp.dest(distDir))
            .pipe(connect.reload());
    };

    gulp.task('build-js', () => {

        return createStream({
            distDir: './dist',
            distFile: 'tauCharts.js',
            rollupConfig: mainConfig,
            production: false
        }).pipe(connect.reload());

    });

    gulp.task('build-plugins-js', () => {

        const streams = plugins.map((p) => {
            const [plugin, pluginConfig] = (Array.isArray(p) ? p : [p, {}]);
            return createStream({
                distDir: './dist/plugins',
                distFile: `tauCharts.${plugin}.js`,
                rollupConfig: Object.assign(
                    {},
                    pluginsCommonConfig,
                    pluginConfig,
                    { entry: `./plugins/${plugin}.js` }
                ),
                production: false
            });
        });

        return eventStream
            .merge(streams)
            .pipe(connect.reload());

    });
};
