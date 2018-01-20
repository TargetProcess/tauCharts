dev.spec({
    type: 'stacked-area',
    x: 'Team',
    y: 'Value',
    color: 'Date',
    guide: {
        color: {
            tickPeriod: 'month'
        }
    },
    dimensions: {
        'Value': {
            scale: 'linear',
            type: 'measure'
        },
        'Date': {
            scale: 'period',
            type: 'order'
        },
        'Team': {
            scale: 'ordinal',
            type: 'category'
        },
    },
    settings: {
        utcTime: true
    },
    plugins: [
        Taucharts.api.plugins.get('tooltip')(),
        Taucharts.api.plugins.get('legend')()
    ],
    data: dev.randomData({
        'Value': dev.random.number().max(100),
        'Date': dev.random.date('2017-01-01').period('month').count(4),
        'Team': dev.random.enum('Taucharts', 'Vizydrop')
    })
});
