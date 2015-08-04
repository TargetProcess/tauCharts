window.samples.push({

    type: 'horizontal-stacked-bar',
    x: ['Count'],
    y: ['Country'],
    color: 'Sport',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')({
            // fields: ['Athlete', 'Age', 'Total Medals', 'Sport']
        })
    ],

    data: _(olimpics)
        .chain()
        .reduce(function (memo, row) {
            var key = row['Country'] + row['Sport'];
            if (!memo.hasOwnProperty(key)) {
                memo[key] = {
                    'Country': row['Country'],
                    'Sport': row['Sport'],
                    'Count': 0
                };
            }

            memo[key].Count += row['Total Medals'];

            return memo;
        },
        {})
        .values()
        .filter(function (row) {
            return ['Biathlon', 'Ice Hockey'].indexOf(row['Sport']) >= 0;
        })
        .sortBy('Count')
        .value()

});