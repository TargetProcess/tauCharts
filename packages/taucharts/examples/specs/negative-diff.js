dev.spec({
    type: 'stacked-area',
    x: 'Date',
    y: 'Value',
    color: 'Team',
    guide: {
        x: {
            timeInterval: 'month'
        }
    },
    settings: {
        utcTime: true
    },
    plugins: [
        Taucharts.api.plugins.get('diff-tooltip')(),
        Taucharts.api.plugins.get('legend')()
    ],
    data: dev.randomData({
        'Value': dev.random.number().min(-100).max(100),
        'Date': dev.random.date('2017-01-01').period('month').count(10),
        'Team': dev.random.enum('Taucharts', 'Vizydrop')
    })
});
