var now = new Date();

var gendata = function (num) {
    var zzz = num || 100;
    return utils.range(zzz)
        .reduce(function (memo, i) {
            var x = i * (Math.PI / 100);

            return memo.concat([
                {
                    x: new Date(now - i * 1000 * 60 * 60 * 24),
                    z: 'A',
                    sin: Math.sin(x) * 10,
                    cos: Math.cos(x) * 10,
                    r0: Math.random(x) * 10,
                    r1: Math.random(x) * 10
                }
                ,
                {
                    x: new Date(now - i * 1000 * 60 * 60 * 24),
                    z: 'B',
                    sin: Math.sin(x) * 10,
                    cos: Math.cos(x) * 10,
                    r0: Math.random(x) * 10,
                    r1: Math.random(x) * 10
                }
            ]);
        }, []);
};

dev.spec({

    //dimensions: {
    //    x: {type: 'order', scale: 'period'},
    //    z: {type: 'category', scale: 'ordinal'},
    //    sin: {type:'measure', scale: 'linear'},
    //    cos: {type:'measure', scale: 'linear'},
    //    r0: {type:'measure', scale: 'linear'},
    //    r1: {type:'measure', scale: 'linear'}
    //},
    data: gendata(10),
    type: 'scatterplot',
    x: ['x'],
    y: ['z', 'sin'],
    guide: [
        {},
        {
            // x: {tickPeriod: 'day'},
            y: {
                nice: false,
                min: -20,
                max: 25,
                label: 'Sinus'
            }
        }
    ],
    settings: {
        excludeNull: false
    },
    plugins: [
        Taucharts.api.plugins.get('layers')({
            // mode: 'dock',
            showPanel: true,
            layers: [
                {
                    type: 'area',
                    y: 'cos',
                    guide: {
                        nice: false,
                        label: 'Cosinus'
                    }
                }
                ,
                {
                    type: 'line',
                    y: 'r1',
                    guide: {
                        nice: false,
                        label: 'Random'
                    }
                }
            ]
        })
        ,
        Taucharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'sin',
                    val: [3, 7],
                    text: 'Horizontal annotation',
                    color: '#4300FF'
                }
            ]
        })
        ,
        Taucharts.api.plugins.get('legend')()
        ,

        Taucharts.api.plugins.get('quick-filter')()
        ,

        Taucharts.api.plugins.get('trendline')()
        ,

        Taucharts.api.plugins.get('tooltip')()
    ]
});