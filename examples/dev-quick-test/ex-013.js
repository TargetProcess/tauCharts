window.samples.push({

    type: 'parallel',
    data: cars,
    columns: [
        'economy (mpg)',
        'cylinders',
        'displacement (cc)',
        'power (hp)',
        '0-60 mph (s)',
        'year'
    ],
    color: 'year',
    plugins: [
        tauCharts.api.plugins.get('parallel-brushing')({
            forceBrush: {
                year: [80, 81]
            }
        }),
        tauCharts.api.plugins.get('parallel-tooltip')()
        // ,
        // tauCharts.api.plugins.get('geomap-legend')()
    ]

});