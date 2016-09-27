dev.spec({

    type: 'map',
    code: 'state',
    fill: 'population',
    guide: {
        code: {georole:'states'},
        fill: {
//                brewer: utils.range(9).map(function(i) {
//                    return 'rgba(150, 218, 195, ' + (0.1 * i + 0.1) + ')';
//                })
        },
        sourcemap: './../src/addons/usa-states.json'
    },
    data: [
        {state: 'wa', population: 25},
        {state: 'ks', population: 35},
        {state: 'ca', population: 3005},
        {state: 'ma', population: 300},
        {state: 'ny', population: 250},
        {state: 'ak', population: 5000},
        {state: 'co', population: 1250}
    ],
    plugins: [
        tauCharts.api.plugins.get('geomap-tooltip')(),
        tauCharts.api.plugins.get('geomap-legend')()
    ]

});