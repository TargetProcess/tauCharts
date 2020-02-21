dev.spec({

    sources: {
        '?': {
            dims: {},
            data: [{}]
        },
        '/': {
            dims: {},
            data: [
                {latitude: 42.36, longitude: -71, count: 5, city: 'Boston'},
                {latitude: 34.03, longitude: -118.15, count: 25, city: 'LA'}
            ]
        }
    },

    scales: {
        lat: {type: 'linear', dim: 'latitude', source: '/'},
        lon: {type: 'linear', dim: 'longitude', source: '/'},
        size: {type: 'size', dim: 'count', source: '/', mid: 5, min: 1, max: 10},
        color: {type: 'color', source: '?'},
        'value:default': {type: 'value', source: '?'},
        'fill:default': {
            type: 'fill',
            source: '?'
        }
    },

    unit: {
        type: 'COORDS.MAP',
        latitude: 'lat',
        longitude: 'lon',
        size: 'size',
        color: 'color',

        // code: 'value:default',
        // fill: 'default:color',

        expression: {
            operator: 'none',
            source: '/'
        },

        guide: {
            sourcemap: './../src/addons/usa-states.json'
        }
    }

});