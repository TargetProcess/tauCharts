dev.spec({

    _name: 'Chart of Fame',
    _desc: 'Explore achievements of belarusian olympic athletes',

    type: 'horizontal-bar',
    y: ['Sport', 'Athlete'],
    x: ['Total Medals'],

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('olympics', function (data) {
        var processedData = data
            .filter(function (row) {
                return ['Belarus'].indexOf(row['Country']) >= 0;
            })
            .reduce(function (memo, row) {
                var k = row['Athlete'];
                if (!memo[k]) {
                    memo[k] = Object.assign({}, row);
                    memo[k]['Total Medals'] = 0;
                }

                memo[k]['Total Medals'] += row['Total Medals'];
                return memo;
            }, {});

        return Object.keys(processedData).map(key => processedData[key]);

    })
});
