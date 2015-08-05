window.samples.push({

    name: 'Scatterplot',
    desc: 'Looks like ...',
    spec: {

        type: 'scatterplot',
        x: ['Year'],
        y: ['Country'],
        color: 'Sport',
        size: 'Count',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')({
                // fields: ['Athlete', 'Age', 'Total Medals', 'Sport']
            })
        ],

        data: _(olimpics)
            .chain()
            .reduce(function (memo, row) {
                var key = row['Country'] + row['Sport'] + row['Year'].getTime();
                if (!memo.hasOwnProperty(key)) {
                    memo[key] = {
                        'Country': row['Country'],
                        'Sport': row['Sport'],
                        'Year': row['Year'],
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
            .value()

    }
});