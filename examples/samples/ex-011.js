dev.sample({

    name: 'Funnel',
    desc: 'Look, it is a stacked bar chart with size assigned',
    spec: {

        type: 'stacked-bar',
        y: ['count'],
        x: ['process'],
        color: 'stage',
        size: 'ABS(count)',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

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
            .map(function (row) {
                row['ABS(count)'] = Math.abs(row.count);
                return row;
            })
    }
});