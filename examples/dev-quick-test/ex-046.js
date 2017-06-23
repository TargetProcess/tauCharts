var now = new Date();
function days (i) {
    return (new Date(now - i * 1000 * 60 * 60 * 24));
}

dev.spec({
    data:[
        {
            x: days(7),
            followersNoneData: 0
        }, {
            x: days(6),
        }, {
            x: days(5),
            followers: 30,
            followersNoneData: 30,
            reposts: 13,
            likes: 23,
            comments: 17
        }, {
            x: days(3),
            likes: 42,
            reposts: 17,
            comments: 19
        }, {
            x: days(2),
            followers: 37,
            reposts: 11,
            likes: 23,
            comments: 14
        },
        {
            x: days(7),
            reposts: 10,
            likes: 21,
            comments: 10
        }
    ],
    settings: {
        specEngine: 'none'
        // , xAxisTickLabelLimit: 100
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
                text:'FLWRS',
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
    type: 'line',
    x: ['x'],
    y: ['followers'],
    plugins: [

        Taucharts.api.plugins.get('layers')({
            mode: 'dock',
            showPanel: true,
            brewer: {
                "likes": 'color20-1',
                "reposts": 'color20-7',
                "comments": 'color20-9',
                "Followers": 'color20-2',
                "followersNoneData": 'color20-3 graphical-report__trendline'
            },
            layers: [
                {
                    type: 'stacked-bar',
                    y: ['likes', 'reposts', 'comments'],
                    guide: {
                        scaleOrient: 'left',
                        textAnchor: 'end',
                        label: {
                            byKeys: {
                                likes: "LKS",
                                comments: "CMNTS"
                            }
                        }
                    }
                },
                {
                    type: 'line',
                    y: 'followersNoneData',
                    guide: {
                        scaleOrient: 'left',
                        textAnchor: 'end',
                        hide: true
                    }
                }
            ]
        })
        ,

        Taucharts.api.plugins.get('legend')()
        ,
        Taucharts.api.plugins.get('tooltip')()
    ]
});