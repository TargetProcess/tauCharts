var COORDS = {
    RECT: function(dim, tail) {
        var subUnits = _.isArray(tail) ? tail : [tail];
        var isFacet = (subUnits[0].type === 'COORDS.RECT');
        return {
            type: 'COORDS.RECT',
            guide: {
                showGridLines: (isFacet ? '' : 'xy'),
                padding: {L: 64, B: 32, R: 8, T: 8}
            },
            axes: dim,
            unit: subUnits
        };
    }
};

var DIM = function(x, y) {
    return [
        x ? {scaleDim: x} : null,
        y ? {scaleDim: y} : null
    ];
};

var ELEMENT = {
    POINT: function (x, y, color, size) {
        return {
            type: 'ELEMENT.POINT',
            x: x,
            y: y,
            color: color,
            size: size
        };
    }
};

export {COORDS};
export {DIM};
export {ELEMENT};

//{
//    dimensions: {
//        project: { scaleType: 'ordinal' },
//        team: { scaleType: 'ordinal' },
//        cycleTime: { scaleType: 'linear' },
//        effort: { scaleType: 'linear' }
//    },
//    data: [],
//    unit: COORDS.RECT(DIM('project', 'team'), COORDS.RECT(DIM('cycleTime', 'effort'), ELEMENT.POINT('cycleTime', 'effort')))
//}