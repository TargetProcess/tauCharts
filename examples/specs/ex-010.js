dev.spec({

    name: 'Amount of olympic medals per athlete age in different countries',
    desc: 'Country as a color',
    spec: {

        type: 'stacked-bar',
        y: ['Sport', 'SUM(Total Medals)'],
        x: ['Age'],
        color: 'Country',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

        data: dev.dataset('olympics', function (data) {
            return _(data)
                .chain()
                .reduce(function (memo, row) {
                    var key = row['Sport'] + row['Age'] + row['Country'];
                    if (!memo.hasOwnProperty(key)) {
                        memo[key] = {
                            'Country': row['Country'],
                            'Sport': row['Sport'],
                            'Age': row['Age'],
                            'SUM(Total Medals)': 0
                        };
                    }

                    memo[key]['SUM(Total Medals)'] += row['Total Medals'];

                    return memo;
                },
                {})
                .values()
                .filter(function (row) {
                    return ['Biathlon', 'Ice Hockey'].indexOf(row['Sport']) >= 0;
                })
                .value();
        })
    },
    _oldFormat: true
});