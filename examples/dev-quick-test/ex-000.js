var now = new Date();

window.samples.push({

    type: 'line',
    x: ['x'],
    y: ['y'],
    label: 'y',
    guide: {
        anchorSize: 1.5,
        label: {
            tickFormat: '.4r'
        }
    },

    data: _.times(100, _.identity)
        .reduce(function (memo, i) {
            var x = i * (Math.PI / 100);
            return memo.concat([
                {
                    x: new Date(now - i * 1000 * 60 * 60 * 24),
                    y: Math.random(x) * 10
                }
            ]);
        }, []),

    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'x',
                    val: [now - 12 * 24 * 60 * 60 * 1000, now - 2 * 24 * 60 * 60 * 1000],
                    text: 'Milestone 1'
                },
                {
                    dim: 'x',
                    val: [now - 22 * 24 * 60 * 60 * 1000, now - 14 * 24 * 60 * 60 * 1000],
                    text: 'Milestone 2',
                    position: 'front',
                    color: '#4300FF'
                },
                {
                    dim: 'y',
                    val: 2,
                    text: 'Bottom line',
                    position: 'front',
                    color: '#FFAB00'
                },
                {
                    dim: 'x',
                    val: now - 35 * 24 * 60 * 60 * 1000,
                    text: 'Build 33',
                    color: 'green'
                }
            ]
        })
    ]
});

window.samples.push({

    type: 'line',
    x: ['x'],
    y: ['y'],

    data: _.times(100, _.identity)
        .reduce(function (memo, i) {
            var x = i * (Math.PI / 100);
            return memo.concat([
                {
                    x: x * 10,
                    y: Math.sin(x) * 10,
                    type: 'sin'
                }
            ]);
        }, [])
        .filter(function (row) {
            //return row.y >= 0;
            return true;
        }),

    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'x',
                    val: [15, 25],
                    text: '[15-25]'
                },
                {
                    dim: 'y',
                    val: [3, 7],
                    text: 'Horizontal annotation',
                    color: '#4300FF'
                },
                {
                    dim: 'y',
                    val: 2,
                    text: 'Super text (1:2)',
                    color: '#FFAB00'
                },
                {
                    dim: 'x',
                    val: 6,
                    text: 'Build number(1:2)'
                }
            ]
        })
    ]
});

window.samples.push({

    type: 'line',
    x: ['x'],
    y: ['y'],
    color: 'type',
    size: 's',

    guide: [
        {
            color: {
                brewer: ['#ff0000', '#00ff00']
            },
            x: {nice: false},
            y: {nice: false}
            // ,flip: true
        }
    ],

    data: _.times(100, _.identity)
        .reduce(function (memo, i) {
            var x = i * (Math.PI / 100);
            return memo.concat([
                {
                    x: x,
                    y: Math.sin(x),
                    s: Math.random(),
                    type: 'sin'
                },
                {
                    x: x,
                    y: Math.cos(x),
                    s: Math.random(),
                    type: 'cos'
                }
            ]);
        }, [])
        .filter(function (row) {
            //return row.y >= 0;
            return true;
        }),

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('trendline')({showPanel: false}),
        tauCharts.api.plugins.get('exportTo')()
    ]
});

window.samples.push({

    sources: {
        '?': {
            dims: {},
            data: [{}]
        },
        '/': {
            dims: {
                'car': {type: 'category'},
                'co2': {type: 'measure'},
                'hp': {type: 'measure'},
                'mpg': {type: 'measure'}
            },
            data: [
                {car: "Toyota Prius+", co2: 96, hp: 99, mpg: 3.8},
                {car: "Volvo S60", co2: 135, hp: 150, mpg: 7.4},
                {car: "BMV X5", co2: 197, hp: 306, mpg: 11.2},
                {car: "Infinity FX", co2: 238, hp: 238, mpg: 11.2},
                {car: "Mercedes Vito", co2: 203, hp: 95, mpg: 9.4},
                {car: "Peugeot 3008", co2: 155, hp: 120, mpg: 9.2},
                {car: "Subaru Forester", co2: 186, hp: 150, mpg: 10.4},
                {car: "Lexus RX", co2: 233, hp: 188, mpg: 13.3},
                {car: "Bentley Continental", co2: 246, hp: 507, mpg: 15.4}
            ]
        }
    },

    scales: {
        car: {type: 'ordinal', dim: 'car', source: '/'},
        co2: {type: 'linear', dim: 'co2', source: '/'},
        mpg: {type: 'linear', dim: 'mpg', source: '/'},
        hp: {type: 'linear', dim: 'hp', source: '/'},
//                  size: {type: 'size', dim: 'count', source: '/', mid: 5, min: 1, max: 10},
//                  color: {type: 'color', dim: 'city', source: '/'},
        color: {type: 'color', source: '?'}
    },

    unit: {
        type: 'COORDS.PARALLEL',
        color: 'color',
        columns: ['car', 'hp', 'co2', 'mpg'],
        expression: {
            operator: 'none',
            source: '/'
        },
        guide: {
            padding: {l: 120, b: 50, t: 50, r: 50},
            columns: {
                car: {
                    label: {text: 'Car Name'},
                    brush: ['Lexus RX', 'BMV X5']
                },
                hp: {
                    label: {text: 'Horse power'},
                    brush: [150, 250]
                },
                co2: {label: {text: 'CO2'}},
                mpg: {label: {text: 'Miles per galon'}}
            }
        },
        units: [
            {
                type: 'PARALLEL/ELEMENT.LINE',
                color: 'color',
                columns: ['car', 'hp', 'co2', 'mpg'],
                expression: {
                    operator: 'none',
                    source: '/'
                }
            }
        ]
    },

    plugins: [
        tauCharts.api.plugins.get('parallel-brushing')({
            forceBrush: {
                hp: [150, 200]
            }
        }),
        tauCharts.api.plugins.get('parallel-tooltip')(),
        tauCharts.api.plugins.get('geomap-legend')(),
        tauCharts.api.plugins.get('exportTo')()
    ]

});