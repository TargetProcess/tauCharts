window.samples.push({

    type: 'map',
    latitude: 'y',
    longitude: 'x',
    size: 'size',
    data: [
        {x: 0.5, y: 51.32, color: 'green', size: 2},
        {x: 0.5, y: 51.35, color: 'red', size: 20}
    ],
    guide: {
        sourcemap: './../src/addons/uk-subunits-places.json'
    },
    plugins: [
        tauCharts.api.plugins.get('geomap-tooltip')(),
        tauCharts.api.plugins.get('geomap-legend')()
    ]

});