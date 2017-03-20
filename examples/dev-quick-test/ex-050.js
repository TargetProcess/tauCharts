dev.spec({
    type: 'scatterplot',
    x: 'dx',
    y: 'dy',
    color: 'sin_dist',
    guide: {
        color: {
            min: -1,
            max: 1,
            nice: false
        }
    },
    data: utils.range(1000).map(function (n) {
        var x = Math.random(n) * 10;
        var y = Math.random(n) * 10;
        return {
            dx: x,
            dy: y,
            sin_dist: Math.sin(Math.sqrt(Math.pow(x - 5, 2) + Math.pow(y - 5, 2)))
        };
    }),
    plugins: [
        tauCharts.api.plugins.get('legend')()
    ]
});