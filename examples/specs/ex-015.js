dev.spec({

    _name: 'Geo chart of Olympics data',
    _desc: 'SUM(Total Medals) as color saturation',

    type: 'map',
    code: 'Country',
    fill: 'SUM(Total Medals)',

    guide: {
        showNames: false
    },

    data: dev.dataset('olympics', function (data) {
        var processedData = data
            .reduce(function (memo, row) {
                var k = row['Country'];
                if (!memo[k]) {
                    memo[k] = {
                        'Country': k,
                        'SUM(Total Medals)': 0
                    };
                }

                memo[k]['SUM(Total Medals)'] += row['Total Medals'];
                return memo;
            }, {});

        return Object.keys(processedData).map(function (key) {
            return processedData[key];
        });

    })

});
