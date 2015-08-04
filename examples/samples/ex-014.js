window.samples.push({

    type: 'horizontal-bar',
    y: ['Sport', 'Athlete'],
    x: ['Country', 'Total Medals'],

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
                (['Belarus', 'Canada', 'United States'].indexOf(row['Country']) >= 0)
                &&
                (['Shooting'].indexOf(row['Sport']) >= 0)
            );
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
        .value()

});