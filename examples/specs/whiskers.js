dev.spec({
    type: 'scatterplot',
    y: 'distribution',
    x: 'y',
    color: 'distribution',
    data: _.times(100, _.identity)
        .reduce(function (memo, i) {

            var outlierKoeff = function (lim) {
                return (Math.random() >= lim) ? 100 : 1;
            };

            // n = 6 gives a good enough approximation
            function rnd2() {
                return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
            }

            return memo.concat([
                {
                    y: rnd2(),
                    distribution: 'A'
                },
                {
                    y: rnd2() * outlierKoeff(0.95),
                    distribution: 'B'
                }
            ]);
        }, [])
        .filter(function () {
            var rand = Math.random();
            return rand > 0.5 && rand < 0.75;
        }),

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('box-whiskers')({
            flip: true,
            //mode: 'show-scatter',
            //mode: 'hide-scatter',
            mode: 'outliers-only'
        })
    ]
});