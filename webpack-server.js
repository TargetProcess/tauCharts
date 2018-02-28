/* global process */
const WebpackDevServer = require(`webpack-dev-server`);
const webpack = require(`webpack`);
const path = require('path');
const conf = require(`./webpack.config`);
const WATCHER_SERVER_LISTENING_PORT = process.env.WEBPACK_PORT || 8080;

const compiler = webpack(conf);

const server = new WebpackDevServer(compiler, {
    quiet: false,
    noInfo: false,
    open: true,
    hot: true,
    historyApiFallback: false,
    contentBase: path.resolve('./examples/'),
    watchOptions: {
        aggregateTimeout: 300,
        poll: false,
    },
    disableHostCheck: true,
    headers: {
        'Access-Control-Allow-Origin': `*`,
    },
    publicPath: `/dist/`,
    stats: `errors-only`,
});
server.listen(WATCHER_SERVER_LISTENING_PORT);
