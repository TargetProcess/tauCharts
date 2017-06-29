dev.spec({

    _name: 'Funnel',
    _desc: 'Look, it is a stacked bar chart with size assigned',

    type: 'stacked-bar',
    y: ['count'],
    x: ['process'],
    color: 'stage',
    size: 'ABS(count)',

    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
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
});
