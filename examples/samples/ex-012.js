window.samples.push({

    type: 'line',
    y: ['SUM(Total Medals)'],
    x: ['Age'],
    color: 'Sport',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    data: _(olimpics)
        .chain()
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
        {})
        .values()
        .value()

});