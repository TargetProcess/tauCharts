window.samples.push({
    "type": "scatterplot",
    "x": ["x1"],
    "y": ["y1", "y2"],
    data: _.times(16, function (i) {
        return {
            x1: Math.round(Math.random() * 100000) + 1,
            y1: Math.random() > 0.25 ? 'BIG' : 'SMALL',
            y2: String.fromCharCode(65 + i)
        };
    }),
    dimensions: {
        x1: { 'type': 'measure', 'scale': 'logarithmic' },
        y1: { 'type': 'category', 'scale': 'ordinal' },
        y2: { 'type': 'category', 'scale': 'ordinal' }
    }
});