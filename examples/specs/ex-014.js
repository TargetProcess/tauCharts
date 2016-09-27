dev.spec({

    _name: 'Drill down to belarusian canoeing dynamic',
    _desc: 'Looks like the school of champions grows',

    type: 'horizontal-bar',
    y: ['Sport', 'Athlete'],
    x: ['FullYear', 'Total Medals'],

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    settings: {
        fitModel: 'entire-view'
    },

    data: dev.dataset('olympics', function (data) {
        var processedData = data
            .filter(function (row) {
                return (
                    (['Belarus'].indexOf(row['Country']) >= 0)
                    &&
                    (['Canoeing'].indexOf(row['Sport']) >= 0)
                );
            })
            .reduce(function (memo, row) {
                var k = row['Athlete'] + row['Year'].getFullYear();
                if (!memo[k]) {
                    memo[k] = Object.assign({}, row);
                    memo[k]['Total Medals'] = 0;
                    memo[k]['FullYear'] = row['Year'].getFullYear();
                }

                memo[k]['Total Medals'] += row['Total Medals'];
                return memo;
            }, {});

        return Object.keys(processedData)
            .map(key => processedData[key])
            .sort(function(x1, x2) {
                return x1['FullYear'] - x2['FullYear'];
            })
            .map(function (row) {
                row['FullYear'] = row['FullYear'].toString();
                return row;
            });
    })

});
