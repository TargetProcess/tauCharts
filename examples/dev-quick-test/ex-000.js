window.samples.push({

        type: 'area',
        x: ['x'],
        y: ['y'],
        color: 'type',

        guide: [
            // {},
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
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')(),
            tauCharts.api.plugins.get('trendline')({showPanel:false})
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
        tauCharts.api.plugins.get('geomap-legend')()
    ]

});