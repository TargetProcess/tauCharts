const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

const tauchartsMainConfig = {
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
        require('rollup-plugin-babel')({
            presets: [
                ['es2015', {
                    modules: false
                }]
            ],
            plugins: [
                'external-helpers'
            ]
        })
    ]
};

var devBuildCache;

module.exports = (gulp, { connect }) => {

    gulp.task('build-js', () => {

        const devBuildConfig = {
            rollup: require('rollup'),
            cache: devBuildCache,
            sourceMap: false
        };

        return rollup(Object.assign({}, tauchartsMainConfig, devBuildConfig))
            .on('bundle', (bundle) => devBuildCache = bundle)
            .pipe(source('tauCharts.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(connect.reload());

    });
};
