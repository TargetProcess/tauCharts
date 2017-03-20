import {utils} from '../utils/utils';
var ChartMap = (config) => {
    let guide = Object.assign({sourcemap: config.settings.defaultSourceMap}, config.guide || {});

    guide.size = utils.defaults(guide.size || {}, {min: 1, max: 10});
    guide.code = utils.defaults(guide.code || {}, {georole: 'countries'});

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
            scales[key] = Object.assign({type: type, source: src, dim: dim}, guide);
        }

        return key;
    };

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
            type: 'COORDS.MAP',

            expression: {operator: 'none', source: '/'},

            code: scalesPool('value', config.code, guide.code),
            fill: scalesPool('fill', config.fill, guide.fill),

            size: scalesPool('size', config.size, guide.size),
            color: scalesPool('color', config.color, guide.color),
            latitude: scalesPool('linear', config.latitude, {nice: false}),
            longitude: scalesPool('linear', config.longitude, {nice: false}),

            guide: guide
        },

        plugins: config.plugins || []
    };
};

export {ChartMap};