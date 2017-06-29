dev.spec({

    _name: 'Compare USA and Canada in amount of olympic medals per athlete age',
    _desc: 'Looks like colored bar chart is mush better',

    type: 'bar',
    y: ['Sport', 'SUM(Total Medals)'],
    x: ['AgeOrdinal'],
    color: 'Country',

    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
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
                        'AgeOrdinal': row['Age'] ? row['Age'].toString() : null,
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
                return (
                    (['United States', 'Canada'].indexOf(row['Country']) >= 0)
                    &&
                    (['Ice Hockey'].indexOf(row['Sport']) >= 0)
                );
            })
            .sort(function(x1, x2) {
                return x1['Age'] - x2['Age'];
            });
    })
});
