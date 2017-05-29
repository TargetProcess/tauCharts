import {
    ChartConfig
} from '../definitions';

interface ParallelConfig extends ChartConfig {
    columns: string[];
}

const ChartParallel = (config: ParallelConfig) => {

    var guide = Object.assign({columns: {}}, (config.guide as ChartConfig) || {});

    var scales = {};

    var scalesPool = (type, prop, guide = {}) => {
        var key;
        var dim = prop;
        var src;
        if (!prop) {
            key = `${type}:default`;
            src = '?';
        } else {
            key = `${type}_${prop}`;
            src = '/';
        }

        if (!scales.hasOwnProperty(key)) {
            scales[key] = Object.assign(
                {type: type, source: src, dim: dim},
                guide
            );
        }

        return key;
    };

    var cols = config.columns.map((c) => scalesPool(config.dimensions[c].scale, c, guide.columns[c]));

    return {
        sources: {
            '?': {
                dims: {},
                data: [{}]
            },
            '/': {
                dims: Object
                    .keys(config.dimensions)
                    .reduce((dims, k) => {
                        dims[k] = {type: config.dimensions[k].type};
                        return dims;
                    }, {}),
                data: config.data
            }
        },

        scales: scales,

        unit: {
            type: 'COORDS.PARALLEL',
            expression: {operator: 'none', source: '/'},
            columns: cols,
            guide: guide,
            units: [
                {
                    type: 'PARALLEL/ELEMENT.LINE',
                    color: scalesPool('color', config.color, guide.color),
                    columns: cols,
                    expression: {operator: 'none', source: '/'}
                }
            ]
        },

        plugins: config.plugins || []
    };
};

export {ChartParallel};