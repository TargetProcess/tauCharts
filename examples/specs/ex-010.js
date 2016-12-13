dev.spec({

    _name: 'Amount of olympic medals per athlete age in different countries',
    _desc: 'Country as a color',

    type: 'stacked-bar',
    y: ['Sport', 'SUM(Total Medals)'],
    x: ['Age'],
    color: 'Country',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('olympics', function (data) {
        var processedData = data
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
            {});

        return Object.keys(processedData)
            .map(function (key) {
                return processedData[key];
            })
            .filter(function (row) {
                return ['Biathlon', 'Ice Hockey'].indexOf(row['Sport']) >= 0;
            });
    })
});
