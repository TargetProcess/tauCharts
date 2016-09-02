dev.sample({

    name: 'Compare USA and Canada in amount of olympic medals per athlete age',
    desc: 'Looks like colored bar chart is mush better',
    spec: {

        type: 'bar',
        y: ['Sport', 'SUM(Total Medals)'],
        x: ['AgeOrdinal'],
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
                            'AgeOrdinal': row['Age'] ? row['Age'].toString() : null,
                            'SUM(Total Medals)': 0
                        };
                    }

                    memo[key]['SUM(Total Medals)'] += row['Total Medals'];

                    return memo;
                },
                {})
                .values()
                .filter(function (row) {
                    return (
                        (['United States', 'Canada'].indexOf(row['Country']) >= 0)
                        &&
                        (['Ice Hockey'].indexOf(row['Sport']) >= 0)
                    );
                })
                .sortBy('Age')
                .value();
        })
    },
    _oldFormat: true
});