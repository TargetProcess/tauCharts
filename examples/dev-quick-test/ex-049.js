window.samples.push({
    "type": "scatterplot",
    "x": ["x1"],
    "y": ["y1", "y2"],
    data: [
        {
            x1: 3,
            y1: 'BIG',
            y2: 'A'
        }, {
            x1: 230055,
            y1: 'BIG',
            y2: 'B'
        }, {
            x1: 3733453345354,
            y1: 'SMALL',
            y2: 'C'
        }
    ],
    dimensions: {
        x1: { 'type': 'measure', 'scale': 'logarithmic' },
        y1: { 'type': 'category', 'scale': 'ordinal' },
        y2: { 'type': 'category', 'scale': 'ordinal' }
    }
});