dev.spec({
    type: 'scatterplot',
    y: 'distribution',
    x: 'y',
    color: 'distribution',
    data: utils.range(100)
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
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')(),
        Taucharts.api.plugins.get('box-whiskers')({
            flip: true,
            //mode: 'show-scatter',
            //mode: 'hide-scatter',
            mode: 'outliers-only'
        })
    ]
});
