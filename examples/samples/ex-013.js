dev.sample({

    name: 'Chart of Fame',
    desc: 'Explore achievements of belarusian olympic athletes',
    spec: {

        type: 'horizontal-bar',
        y: ['Sport', 'Athlete'],
        x: ['Total Medals'],

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

        data: dev.dataset('olympics', function (data) {
            return _(data)
                .chain()
                .filter(function (row) {
                    return ['Belarus'].indexOf(row['Country']) >= 0;
                })
                .reduce(function (memo, row) {
                    var k = row['Athlete'];
                    if (!memo[k]) {
                        memo[k] = _.clone(row);
                        memo[k]['Total Medals'] = 0;
                    }

                    memo[k]['Total Medals'] += row['Total Medals'];
                    return memo;
                }, {})
                .values()
                .value();
        })
    }
});