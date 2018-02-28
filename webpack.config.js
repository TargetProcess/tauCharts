const taucharts = require('./config/webpack.config.taucharts-scripts');
const plugins = require('./config/webpack.config.taucharts-scripts-plugins');
const styles = require('./config/webpack.config.taucharts-styles');

module.exports = [taucharts, plugins].concat(styles);
