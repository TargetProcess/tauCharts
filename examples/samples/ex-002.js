window.samples.push({

    name: 'Sin / Cos plot',
    desc: 'Streaming with trend lines',
    spec: {

        type: 'bar',
        x: ['x'],
        y: ['type', 'y'],
        color: 'type',

        guide: [
            {},
            {
                x: {autoScale: false},
                y: {autoScale: false, min: -1.5, max: 1.5},
                interpolate: 'basis'
            }
        ],

        data: _.times(100, _.identity).reduce(function (memo, i) {
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
            tauCharts.api.plugins.get('trendline')({showPanel:false})
        ]
    }
});