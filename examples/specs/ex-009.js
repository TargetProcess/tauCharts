dev.spec({

    _name: 'Histogram: amount of olympic medals per athlete age',
    _desc: 'Looks like there are no chances to get medals in Rhythmic Gymnastics after 25...',

    type: 'bar',
    y: ['Sport', 'SUM(Total Medals)'],
    x: ['Age'],
    // color: 'Sport',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ],

    settings: {
        layoutEngine: 'NONE'
    },

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

        return Object.keys(processedData).map(key => processedData[key]);
    })

});
