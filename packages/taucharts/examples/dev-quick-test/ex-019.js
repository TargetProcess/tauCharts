dev.spec({

    layoutEngine: 'EXTRACT',
    data: dev.dataset('userStories'),
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
                padding: { l:46, b:32, r:0, t:2 },
                y: {label: 'Projects', fitToFrameByDims: false}
            },
            x: null,
            y: 'project',
            unit: [
                {
                    type: 'COORDS.RECT',
                    guide: {
                        padding: { l:120, b:4, r:8, t:4 },
                        y: {label: { text: 'Teams', padding: 100 }, fitToFrameByDims: ['project']}
                    },
                    x: null,
                    y: 'team',
                    unit: [
                        {
                            type: 'COORDS.RECT',
                            guide: {
                                showGridLines: 'xy',
                                padding: { l:48, b:0, r:8, t:4 },
                                x: {label: 'cycle time', padding: 4},
                                y: {label: 'effort', padding: 4}
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
                    ]
                }
            ]
        }
    },
    plugins: [
        Taucharts.api.plugins.get('tooltip')({fields:['team', 'project', 'cycleTime', 'effort']})
    ]

});