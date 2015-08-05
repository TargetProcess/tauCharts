window.samples.push({

    name: 'Scatterplot',
    desc: 'Looks like ...',
    spec: {

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

        data: _(olimpics)
            .chain()
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
                    memo[k] = _.clone(row);
                    memo[k]['Total Medals'] = 0;
                    memo[k]['FullYear'] = row['Year'].getFullYear();
                }

                memo[k]['Total Medals'] += row['Total Medals'];
                return memo;
            }, {})
            .values()
            .sortBy('FullYear')
            .map(function (row) {
                row['FullYear'] = row['FullYear'].toString();
                return row;
            })
            .value()

    }
});