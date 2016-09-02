var now = new Date();

dev.sample({

    data: [
        {z: 'A', x: 'Day1', visits: 10, clicks: 2, likes: 10, total: 100},
        {z: 'A', x: 'Day2', visits: 21, clicks: 3, likes: 15, total: 172},
        {z: 'A', x: 'Day3', visits: 52, clicks: 4, likes: 16, total: 200}
    ],
    type: 'line',
    x: ['x'],
    y: ['total'],
    plugins: [
        tauCharts.api.plugins.get('layers')({
            showPanel: true,
            layers: [
                {
                    type: 'stacked-bar',
                    y: ['visits', 'clicks']
                }
                ,
                {
                    type: 'area',
                    y: 'likes'
                }
            ]
        })
        ,
        tauCharts.api.plugins.get('legend')()
        ,
        tauCharts.api.plugins.get('trendline')()
        ,
        tauCharts.api.plugins.get('tooltip')()
    ]
});