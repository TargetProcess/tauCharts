dev.spec({

    type: 'map',
    latitude: 'y',
    longitude: 'x',
    color: 'color',
    size: 'size',
    data: [
        {x: 0.5, y: 51.32, color: 'green', size: 2},
        {x: 0.5, y: 15.32, color: 'red', size: 2}
    ],
    guide: {
        sourcemap: './../src/addons/world-countries.json'
    },
    plugins: [
        tauCharts.api.plugins.get('geomap-tooltip')(),
        tauCharts.api.plugins.get('geomap-legend')()
    ]

});