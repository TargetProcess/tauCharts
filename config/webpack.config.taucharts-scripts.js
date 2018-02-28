const plugins = require('./scripts-plugins');
const {resolvePath, resolve} = require('./resolve');
const externals = require('./externals');
const webpackModule = require('./scripts-module');
module.exports = {
    devServer: {
        publicPath: '/dist/',
        openPage: 'examples/',
        open: true,
    },
    output: {
        filename: '[name].js',
        path: resolvePath('../dist/'),
        library: 'Taucharts',
        libraryTarget: 'umd',
    },
    entry: {
        'taucharts': [resolvePath(`../src/tau.charts.ts`)],
        'taucharts.min': [resolvePath(`../full/taucharts.full.ts`)]
    },
    resolve,
    externals,
    devtool: 'none',
    mode: `development`,
    module: webpackModule,
    stats: {
        colors: true,
        reasons: true
    },
    plugins,
};
