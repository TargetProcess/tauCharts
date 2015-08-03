window.samples.push({

    data: rawData,
    spec: {
        dimensions: {
            project: { type: 'category' },
            team: { type: 'category' },
            cycleTime: { type: 'measure' },
            effort: { type: 'measure' }
        },
        unit: {
            type: 'COORDS.RECT',
            guide: {
                showGridLines: 'xy',
                padding: { l:56, b:46, r:8, t:8 },
                x: {
                    padding: 8,
                    label: 'Cycle Time',
                    autoScale: false
                },
                y: {
                    padding: 8,
                    label: 'Effort',
                    autoScale: false
                }
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
    },
    plugins: [
        tauCharts.api.plugins.get('tooltip')({fields:['team', 'project', 'cycleTime', 'effort']})
    ]

});