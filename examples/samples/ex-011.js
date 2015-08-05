window.samples.push({

    name: 'Scatterplot',
    desc: 'Looks like ...',
    spec: {

        type: 'stacked-bar',
        y: ['count'],
        x: ['process'],
        color: 'stage',
        size: 'abs-count',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

        settings: {
            // layoutEngine: 'NONE'
        },

        data: [
            {
                process: 'sales',
                stage: 'visit',
                count: 100
            },
            {
                process: 'sales',
                stage: 'trial',
                count: 50
            },
            {
                process: 'sales',
                stage: 'buy',
                count: 15
            },
            {
                process: 'sales',
                stage: 'go away',
                count: -7
            }
        ]
            .reverse()
            .map(function (row, i) {
                row['i'] = row.count >= 0 ? i : -i;
                row['abs-count'] = Math.abs(row.count);
                return row;
            })

    }
});