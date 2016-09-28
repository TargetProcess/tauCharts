dev.spec({

    _name: 'Sin / Cos plot',
    _desc: 'Streaming with trend lines',

    type: 'bar',
    x: ['x'],
    y: ['type', 'y'],
    color: 'type',

    guide: [
        {},
        {
            x: { nice: false },
            y: { nice: false, min: -1.5, max: 1.5 },
            interpolate: 'basis'
        }
    ],

    data: utils.range(100).reduce(function (memo, i) {
        var x = i * (Math.PI / 100);
        return memo.concat([
            {
                x: x,
                y: Math.sin(x),
                type: 'sin'
            },
            {
                x: x,
                y: Math.cos(x),
                type: 'cos'
            }
        ]);
    }, []),

    plugins: [
        tauCharts.api.plugins.get('trendline')({showPanel: false})
    ]
});
