window.samples.push({

    layoutEngine: 'EXTRACT',
    data: rawData,
    spec: {
        dimensions: {
            project: {type: 'category'},
            team: {type: 'category'},
            cycleTime: {type: 'measure'},
            effort: {type: 'measure'}
        },
        unit: {
            type: 'COORDS.RECT',
            guide: {
                padding: {l: 152, b: 48, r: 0, t: 0},
                x: {label: {text: 'Projects', padding: 32}},
                y: {label: {text: 'Teams', padding: 120}}
            },
            x: 'project',
            y: 'team',
            unit: [
                {
                    type: 'COORDS.RECT',
                    guide: {
                        showGridLines: 'xy',
                        padding: {l: 54, b: 28, r: 16, t: 16},
                        x: {padding: 8, label: ''},
                        y: {padding: 8, label: 'effort'}
                    },
                    x: 'cycleTime',
                    y: 'effort',
                    unit: [
                        {
                            type: 'ELEMENT.POINT',
                            color: 'effort',
                            size: 'cycleTime',
                            shape: null
                        }
                    ]
                }
            ]
        }
    },
    plugins: [
        tauCharts.api.plugins.get('trendline')(),
        tauCharts.api.plugins.get('tooltip')({fields: ['team', 'project', 'cycleTime', 'effort']})
    ]

});