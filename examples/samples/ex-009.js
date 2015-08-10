window.samples.push({

    name: 'Histogram: amount of olympic medals per athlete age',
    desc: 'Looks like there are no chances to get medals in Rhythmic Gymnastics after 25...',
    spec: {

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

    }
});