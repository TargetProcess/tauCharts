dev.spec({

    _name: 'Amount of olympic medals per athlete age',
    _desc: 'Same data in one place. Sport encoded by color',

    type: 'line',
    y: ['SUM(Total Medals)'],
    x: ['Age'],
    color: 'Sport',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('olympics', function (data) {
        var processedData = data
            .reduce(function (memo, row) {
                var key = row['Sport'] + row['Age'];
                if (!memo.hasOwnProperty(key)) {
                    memo[key] = {
                        'Sport': row['Sport'],
                        'Age': row['Age'],
                        'SUM(Total Medals)': 0
                    };
                }

                memo[key]['SUM(Total Medals)'] += row['Total Medals'];

                return memo;
            },
            {});
        return Object.keys(processedData).map(function (key) {
            return processedData[key];
        });

    })
});
