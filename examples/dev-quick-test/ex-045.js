var now = new Date();
function days (i) {
    return (new Date(now - i * 1000 * 60 * 60 * 24));
}

dev.sample({

    data: [
        {z: 'A', x: days(7), reposts: 10, likes: 21, comments: 10, followers: 100},
        {z: 'A', x: days(6),              likes: 20, comments: 7 , followers: 110},
        {z: 'A', x: days(5), reposts: 21, likes: 12, comments: 21, followers: 120},
        {z: 'B', x: days(4), reposts: 14,            comments: 31, followers: 140},
        {z: 'B', x: days(3), reposts: 11, likes: 42, comments: 10, followers: 170},
        {z: 'B', x: days(2), reposts: 2 , likes: 10, comments: 11, followers: 177}
    ],
    type: 'line',
    x: ['x'],
    y: ['z', 'followers'],
    plugins: [
        tauCharts.api.plugins.get('layers')({
            mode: 'dock',
            showPanel: true,
            layers: [
                {
                    type: 'stacked-bar',
                    y: ['reposts', 'likes'],
                    guide: {
                        scaleOrient: 'left',
                        textAnchor: 'end'
                    }
                }
                ,
                {
                    type: 'line',
                    y: 'comments',
                    guide: {
                        scaleOrient: 'left',
                        textAnchor: 'end'
                    }
                }
            ]
        })
        ,
        tauCharts.api.plugins.get('legend')()
        ,
        tauCharts.api.plugins.get('tooltip')()
    ]
});