dev.sample({

    name: 'Geo chart of Olympics data',
    desc: 'SUM(Total Medals) as color saturation',
    spec: {

        type: 'map',
        code: 'Country',
        fill: 'SUM(Total Medals)',

        guide: {
            showNames: false
        },

        data: dev.dataset('olympics', function (data) {
            return _(data)
                .chain()
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
                }, {})
                .values()
                .value();
        })

    },
    _oldFormat: true
});