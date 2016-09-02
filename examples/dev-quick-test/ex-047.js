var now = new Date();
function days (i) {
    return (new Date(now - i * 1000 * 60 * 60 * 24));
}

dev.sample({
    data:[
        {
            x: days(5),
            followers: 30,
            fc: 'Active',
            likes: 23,
            reposts: 13,
            comments: 17
        },
        {
            x: days(3),
            fc: 'Passive',
            followers: 10,
            likes: 42,
            reposts: 17,
            comments: 19
        },
        {
            x: days(2),
            followers: 37,
            fc: 'Active',
            reposts: 11,
            likes: 23,
            comments: 14
        },
        {
            x: days(7),
            followers: 17,
            fc: 'Passive',
            reposts: 10,
            likes: 21,
            comments: 10
        }
    ],
    settings: {
        specEngine: 'none'
    },
    guide: {
        padding: {
            l: 10,
            t: 10,
            r: 50,
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
                padding: -35
            },
            padding: 15,
            rotate: 15,
            tickFormat: 'x-num-auto',
            textAnchor: 'start',
            scaleOrient: 'right'
        },
        showGridLines: 'xy'
    },
    type: 'scatterplot',
    x: 'x',
    y: 'followers',
    color: 'fc',
    plugins: [

        tauCharts.api.plugins.get('layers')({
            mode: 'dock',
            showPanel: true,
            brewer: {
                "likes": 'color20-11',
                "reposts": 'color20-7',
                "comments": 'color20-9',
                "followers": 'color20-17'
            },
            layers: [
                {
                    type: 'line',
                    y: 'likes'
                }
                ,
                {
                    type: 'bar',
                    y: 'comments'
                }
            ]
        })
        ,

        tauCharts.api.plugins.get('legend')()
        ,
        tauCharts.api.plugins.get('tooltip')({
            formatters: {
                //'x': '(%Y-%d-%b)',
                'x': 'month',
                fc: function (srcVal) {
                    return '(' + srcVal + ')';
                }
            }
        })
    ]
});