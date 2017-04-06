const rollup = require('rollup');

module.exports = (gulp) => {
    gulp.task('build-js', () => {
        return rollup.rollup({
            entry: './src/tau.charts.js',
            external: [
                'd3',
                'topojson'
            ],
            plugins: [
                require('rollup-plugin-alias')({
                    'tau-tooltip': 'node_modules/tau-tooltip/src/tooltip.js'
                }),
                require('rollup-plugin-replace')({
                    VERSION: `'${require('../package.json').version}'`
                }),
                require('rollup-plugin-node-resolve')(),
                // require('rollup-plugin-commonjs')(),
                require('rollup-plugin-babel')({
                    presets: [
                        ['es2015', {
                            modules: false
                        }]
                    ],
                    plugins: [
                        'external-helpers'
                    ],
                    externalHelpers: true
                })
            ]
        }).then((bundle) => {
            bundle.write({
                globals: {
                    'd3': 'd3',
                    'topojson': 'topojson'
                },
                exports: 'default',
                format: 'umd',
                moduleId: 'taucharts',
                moduleName: 'tauCharts',
                dest: './dist/tauCharts.js',
                useStrict: false,
                sourceMap: false
            });
        });
    });
};
