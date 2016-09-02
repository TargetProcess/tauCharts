dev.sample({

    name: 'Compare dynamic of achievements across sports and countries',
    desc: 'Looks like Germany has a problems in swimming',
    spec: {

        type: 'scatterplot',
        x: ['Year'],
        y: ['Sport', 'Count'],
        color: 'Country',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('trendline')(),
            tauCharts.api.plugins.get('tooltip')({
                // fields: ['Athlete', 'Age', 'Total Medals', 'Sport']
            })
        ],

        data: dev.dataset('olimpics', function (data) {
            return _(data)
                .chain()
                .filter(function (row) {
                    return (
                        (['Germany', 'Russia', 'United States', 'Japan'].indexOf(row['Country']) >= 0)
                        &&
                        (['Basketball', 'Boxing', 'Judo', 'Tennis', 'Volleyball', 'Swimming', 'Gymnastics'].indexOf(row['Sport']) >= 0)
                    );
                })
                .reduce(function (memo, row) {
                    var key = row['Country'] + row['Sport'] + row['Year'].getFullYear();
                    if (!memo.hasOwnProperty(key)) {
                        memo[key] = {
                            'Country': row['Country'],
                            'Sport': row['Sport'],
                            'Year': row['Year'],
                            'Count': 0
                        };
                    }

                    memo[key]['Count'] += row['Total Medals'];

                    return memo;
                },
                {})
                .values()
                .value()
        })
    },
    _oldFormat: true
});