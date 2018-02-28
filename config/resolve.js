const path = require('path');
const alias = require('./alias');
const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

const resolve = {
    modules: [
        resolvePath('../'),
        'node_modules'
    ],
    alias,
    extensions: ['.js', '.json', '.ts']
};

module.exports = {
    resolve,
    resolvePath
};
