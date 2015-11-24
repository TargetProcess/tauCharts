var now = new Date();
function days (i) {
    return (new Date(now - i * 1000 * 60 * 60 * 24));
}

window.samples.push({

    data: [
        {z: 'Abc', x: days(7), reposts: 10, likes: 21, comments: 10, followers: 100},
        {z: 'Bbc', x: days(6), reposts: 17, likes: 20, comments: 7 , followers: 110},
        {z: 'Cbc', x: days(5), reposts: 21, likes: 12, comments: 21, followers: 120},
        {z: 'Dbc', x: days(4), reposts: 14, likes: 22, comments: 31, followers: 140},
        {z: 'Ebc', x: days(3), reposts: 11, likes: 42, comments: 10, followers: 170},
        {z: 'Fbc', x: days(2), reposts: 2 , likes: 10, comments: 11, followers: 177}
    ],
    settings: {
        specEngine: 'none',
        xAxisTickLabelLimit: 100
    },
    guide: {
        padding: {
            l: 50,
            t: 10,
            r: 10,
            b: 60
        },
        x: {
            label: {
                text: 'XXX',
                padding: 50
            },
            textAnchor: 'start',
            padding: 5,
            rotate: 45,
            tickFormat: 'x-time-auto'
        },
        y: {
            label: {
                text:'Followers',
                padding: 35
            },
            padding: 5,
            rotate: 15,
            tickFormat: 'x-num-auto'
        },
        showGridLines: 'xy'
    },
    type: 'line',
    x: ['x'],
    y: ['followers'],
    plugins: [
        tauCharts.api.plugins.get('layers')({
            showPanel: true,
            layers: [
                {
                    type: 'stacked-bar',
                    y: ['reposts', 'likes']
                }
                ,
                {
                    type: 'line',
                    y: 'comments'
                }
            ]
        })
        ,
        tauCharts.api.plugins.get('legend')()
        ,
        tauCharts.api.plugins.get('tooltip')()
    ]

});