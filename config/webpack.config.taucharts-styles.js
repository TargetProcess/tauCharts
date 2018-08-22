const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {resolvePath} = require('./resolve');
const banner = require('./banner');
const stylesLoader = (lessVariables) => [
    {
        loader: MiniCssExtractPlugin.loader,
    },
    {
        loader: `css-loader`,
        options: {
            importLoaders: 1,
            sourceMap: false,
        },
    },
    {
        loader: `less-loader`,
        options: {
            sourceMap: false,
            paths: [resolvePath(`../less`)],
            modifyVars: lessVariables,
        },
    },
];

const webpackModules = (theme) => ({
    rules: [{
        test: /\.(css|less)$/,
        include: [resolvePath('../less'), resolvePath('../full')],
        use: stylesLoader({theme: theme || 'default'}),
    }]
});

const themes = ['', 'dark'];
const pluginsEntry = {};
const plugins = [
    banner,
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
    }),
];

fs.readdirSync(resolvePath(`../less/plugins/`)).forEach((file) => {
    pluginsEntry[file.replace(/(.+)(\.less)$/ig, '$1')] = resolvePath(`../less/plugins/${file}`);
});

const getEntries = (theme) => {
    return Object.keys(pluginsEntry).reduce((entries, key) => {
        entries[`${key}${theme?`.${theme}`:''}`] = pluginsEntry[key];
        return entries;
    } , {});
};

const tauchartsStyles = themes.map((theme) => ({
    output: {
        filename: '[name].styles.js',
        path: resolvePath('../dist/'),
    },
    entry: {
        [`taucharts${theme?`.${theme}`:''}`]: [resolvePath(`../less/taucharts.less`)],
        [`taucharts${theme?`.${theme}`:''}.min`]: [resolvePath(`../full/taucharts.full.less`)]
    },
    devtool: 'none',
    mode: `development`,
    module: webpackModules(theme),
    plugins,
}));

const tauchartsBrewerStyles = {
    output: {
        filename: '[name].styles.js',
        path: resolvePath('../dist/'),
    },
    entry: {
        'colorbrewer': [resolvePath(`../less/colorbrewer.less`)],
    },
    devtool: 'none',
    mode: `development`,
    module: webpackModules(''),
    plugins,
};

const tauchartsPluginsStyles = themes.map((theme) => ({
    output: {
        filename: '[name].styles.js',
        path: resolvePath('../dist/plugins/'),
    },
    entry: getEntries(theme),
    devtool: 'none',
    mode: `development`,
    module: webpackModules(theme),
    plugins,
}));

module.exports = tauchartsStyles.concat(tauchartsPluginsStyles, tauchartsBrewerStyles);
