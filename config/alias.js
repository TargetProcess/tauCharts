const path = require('path');
const resolvePath = (relativePath) => path.resolve(__dirname, relativePath);

module.exports = {
    'canvg': resolvePath('../node_modules/canvg/canvg.js'),
    'rgbcolor': resolvePath('../node_modules/canvg/rgbcolor.js'),
    'stackblur': resolvePath('../node_modules/canvg/StackBlur.js'),
    'tau-tooltip': resolvePath('../node_modules/tau-tooltip/tooltip.js'),
    'print.style.css': resolvePath('plugins/print.style.css'),
    'taucharts': resolvePath('../src/tau.charts.ts'),
};
