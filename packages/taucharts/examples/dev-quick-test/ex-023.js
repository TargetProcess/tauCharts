dev.spec({

    data: dev.dataset('userStories'),
    type: 'scatterplot',
    x: 'cycleTime',
    y: 'effort',
    color: 'team',
    size: 'effort',

    dimensions: {
        project: {type: 'category', order: ['TP3', 'TP2']},
        team: {type: 'category', order: ['CAT', 'Comet']},
        cycleTime: {type: 'measure'},
        effort: {type: 'measure'}
    },

    ignore_spec: {
        dimensions: {
            project: {type: 'category'},
            team: {type: 'category'},
            cycleTime: {type: 'measure'},
            effort: {type: 'measure'}
        },
        unit: {
            type: 'COORDS.RECT',
            guide: {
                showGridLines: 'xy',
                padding: {l: 56, b: 46, r: 8, t: 8},
                x: {padding: 8, label: 'Cycle Time'},
                y: {padding: 8, label: 'Effort'}
            },
            x: 'cycleTime',
            y: 'effort',
            unit: [
                {
                    type: 'ELEMENT.POINT',
                    color: 'effort',
                    size: 'cycleTime'
                }
            ]
        }
    },
    plugins: [
        Taucharts.api.plugins.get('tooltip')({fields: ['team', 'project', 'cycleTime', 'effort']}),
        Taucharts.api.plugins.get('trendline')(),
        Taucharts.api.plugins.get('legend')()
    ]

});