const d3Modules =  [
    'd3-array',
    'd3-axis',
    'd3-brush',
    'd3-color',
    'd3-format',
    'd3-geo',
    'd3-request',
    'd3-scale',
    'd3-selection',
    'd3-shape',
    'd3-time',
    'd3-time-format',
    'd3-transition',
    'd3-quadtree',
].reduce((modules, module) => {
    modules[module] = {
        commonjs: module,
        amd: module,
        commonjs2: module,
        root: 'd3'
    };
    return modules;
}, {});

module.exports = {
    ...d3Modules,
    'topojson-client':{
        commonjs: 'topojson-client',
        amd: 'topojson-client',
        commonjs2: 'topojson-client',
        root: 'topojson'
    }
};
