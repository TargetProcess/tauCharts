window.samples.push({

    name: 'Scatterplot',
    desc: 'Looks like ...',
    spec: {

    type: 'horizontal-stacked-bar',
    x: ['Sport', 'SUM(Total Medals)'],
    y: ['Country'],
    color: 'Sport',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')({
            // fields: ['Athlete', 'Age', 'Total Medals', 'Sport']
        })
    ],

    settings: {
        fitModel: 'entire-view'
    },

    data: _(olimpics)
        .chain()
        .reduce(function (memo, row) {
            var key = row['Country'] + row['Sport'];
            if (!memo.hasOwnProperty(key)) {
                memo[key] = {
                    'Country': row['Country'],
                    'Sport': row['Sport'],
                    'SUM(Total Medals)': 0
                };
            }

            memo[key]['SUM(Total Medals)'] += row['Total Medals'];

            return memo;
        },
        {})
        .values()
        .filter(function (row) {
            return ['Ice Hockey', 'Bobsleigh'].indexOf(row['Sport']) >= 0;
        })
        .sortBy('SUM(Total Medals)')
        .value()

}});