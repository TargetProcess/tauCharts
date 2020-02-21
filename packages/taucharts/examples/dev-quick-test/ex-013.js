dev.spec({

    type: 'parallel',
    data: dev.dataset('cars'),
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
        Taucharts.api.plugins.get('parallel-brushing')({
            forceBrush: {
                year: [80, 81]
            }
        }),
        Taucharts.api.plugins.get('parallel-tooltip')()
        ,
        Taucharts.api.plugins.get('geomap-legend')()
    ]

});