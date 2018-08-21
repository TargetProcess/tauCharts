const path = require('path');
const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
    'tau-tooltip': resolvePath('../node_modules/tau-tooltip/tooltip.js'),
    'print.style.css': resolvePath('plugins/print.style.css'),
    'taucharts': resolvePath('../src/tau.charts.ts'),
};
