const fs = require('fs');
const plugins = require('./scripts-plugins');
const {resolvePath, resolve} = require('./resolve');
const externals = require('./externals');
const webpackModule = require('./scripts-module');

const pluginsEntry = {
    ['color-brewer']: resolvePath(`../src/addons/color-brewer`)
};

fs.readdirSync(resolvePath(`../plugins/`)).forEach((file) => {
    if(file.endsWith('.js') || file.endsWith('.ts')) {
        pluginsEntry[file.replace(/(.+)(\.js|\.ts)$/ig, '$1')] = resolvePath(`../plugins/${file}`);
    }
});

module.exports = {
    output: {
        filename: '[name].js',
        path: resolvePath('../dist/plugins'),
        libraryTarget: 'umd',
    },
    entry: pluginsEntry,
    resolve,
    externals: {...externals, taucharts: {
            commonjs: 'taucharts',
            commonjs2: 'taucharts',
            amd:'taucharts',
            root: 'Taucharts',
        }
    },
    devtool: 'none',
    mode: 'development',
    module: webpackModule,
    stats: {
        colors: true,
        reasons: true
    },
    plugins: plugins
};
