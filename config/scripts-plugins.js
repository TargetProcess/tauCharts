// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const banner = require('./banner');

module.exports = [
    // new BundleAnalyzerPlugin({analyzerMode: 'static'}),
    banner,
    new webpack.DefinePlugin({
        VERSION: JSON.stringify(require('../package.json').version)
    }),
];
