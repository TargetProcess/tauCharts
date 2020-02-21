dev.spec({
    'type': 'line',
    'x': ['x1'],
    'y': ['y1', 'y2'],
    'size': 's',
    data: [
        {
            s: 25,
            x1: 3,
            y1: 'BIG',
            y2: 'A'
        }, {
            s: 5,
            x1: 230055,
            y1: 'BIG',
            y2: 'B'
        }, {
            s: 25,
            x1: 3733453345354,
            y1: 'SMALL',
            y2: 'C'
        }
    ],
    dimensions: {
        x1: {'type': 'measure', 'scale': 'logarithmic'},
        y1: {'type': 'category', 'scale': 'ordinal'},
        y2: {'type': 'category', 'scale': 'ordinal'}
    }
});