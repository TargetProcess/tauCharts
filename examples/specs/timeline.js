dev.spec({
    type: 'horizontal-bar',
    x: 'end',
    y: ['team', 'type'],
    color: 'type',
    label: 'name',
    plugins: [
        tauCharts.api.plugins.get('bar-as-span')({
            x0: 'start'
        })
    ],
    dimensions: {
        'start': {
            type: 'measure',
            scale: 'time'
        },
        'end': {
            type: 'measure',
            scale: 'time'
        },
        'type': {
            type: 'category',
            scale: 'ordinal'
        },
        'team': {
            type: 'category',
            scale: 'ordinal'
        }
    },
    data: [
        { start: '2015-05-01', end: '2015-06-01', type: 'Bug', name: 'Broken tabs layout', team: 'Developers' },
        { start: '2015-05-10', end: '2015-06-20', type: 'Feature', name: 'Payment form', team: 'Developers' },
        { start: '2015-05-20', end: '2015-05-30', type: 'Feature', name: 'Scroll bar', team: 'Developers' },
        { start: '2015-06-10', end: '2015-06-15', type: 'Bug', name: 'Modal dialog collapsed', team: 'Developers' },
        { start: '2015-05-20', end: '2015-05-25', type: 'Sale', name: 'Tractors', team: 'Sales' },
        { start: '2015-05-25', end: '2015-05-30', type: 'Sale', name: 'Nails', team: 'Sales' },
        { start: '2015-05-26', end: '2015-06-01', type: 'Sale', name: 'Oil', team: 'Sales' }
    ]
});

dev.spec({
    type: 'bar',
    y: 'end',
    x: ['team'],
    color: 'type',
    label: 'name',
    plugins: [
        tauCharts.api.plugins.get('bar-as-span')({
            y0: 'start'
        })
    ],
    dimensions: {
        'start': {
            type: 'measure',
            scale: 'time'
        },
        'end': {
            type: 'measure',
            scale: 'time'
        },
        'type': {
            type: 'category',
            scale: 'ordinal'
        },
        'team': {
            type: 'category',
            scale: 'ordinal'
        }
    },
    data: [
        { start: '2015-05-01', end: '2015-06-01', type: 'Bug', name: 'Broken tabs layout', team: 'Developers' },
        { start: '2015-05-10', end: '2015-06-20', type: 'Feature', name: 'Payment form', team: 'Developers' },
        { start: '2015-05-20', end: '2015-05-30', type: 'Feature', name: 'Scroll bar', team: 'Developers' },
        { start: '2015-06-10', end: '2015-06-15', type: 'Bug', name: 'Modal dialog collapsed', team: 'Developers' },
        { start: '2015-05-20', end: '2015-05-25', type: 'Sale', name: 'Tractors', team: 'Sales' },
        { start: '2015-05-25', end: '2015-05-30', type: 'Sale', name: 'Nails', team: 'Sales' },
        { start: '2015-05-26', end: '2015-06-01', type: 'Sale', name: 'Oil', team: 'Sales' }
    ]
});

dev.spec({
    type: 'horizontal-bar',
    x: 'end',
    y: ['country', 'team'],
    color: 'team',
    label: 'team',
    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('bar-as-span')({
            x0: 'start'
        })
    ],
    // settings:{
    //     fitModel: 'entire-view'
    // },
    data: [
        {start: '2015-02-03', end: '2015-03-02', team: 'Manchester', country: 'England'},
        {start: '2015-02-12', end: '2015-03-01', team: 'Chelsea', country: 'England'},
        {start: '2015-02-17', end: '2015-02-19', team: 'Liverpool', country: 'England'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Aston Villa', country: 'England'},
        {start: '2015-02-24', end: '2015-03-03', team: 'Manchester', country: 'England'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Manchester', country: 'England'},
        {start: '2015-02-29', end: '2015-03-09', team: 'Real', country: 'Spain'},
        {start: '2015-02-24', end: '2015-03-03', team: 'Real', country: 'Spain'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Barcelona', country: 'Spain'},
        {start: '2015-02-29', end: '2015-03-09', team: 'Valencia', country: 'Spain'},
        {start: '2015-02-29', end: '2015-03-09', team: 'Borussia', country: 'Germany'},
        {start: '2015-02-24', end: '2015-03-03', team: 'Borussia', country: 'Germany'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Borussia', country: 'Germany'},
        {start: '2015-02-29', end: '2015-03-09', team: 'Schalke', country: 'Germany'},
        {start: '2015-02-02', end: '2015-02-09', team: 'Bate', country: 'Belarus'},
        {start: '2015-02-05', end: '2015-03-03', team: 'Dynamo', country: 'Belarus'},
        {start: '2015-02-07', end: '2015-02-10', team: 'Dynamo', country: 'Belarus'},
        {start: '2015-02-08', end: '2015-02-20', team: 'Dynamo', country: 'Belarus'},
        {start: '2015-02-12', end: '2015-02-24', team: 'Dynamo', country: 'Belarus'},
        {start: '2015-02-29', end: '2015-03-04', team: 'Shakhtyor', country: 'Belarus'}
    ].map(function (data) {
        return {
            team: data.team,
            start: new Date(data.start),
            end: new Date(data.end),
            country: data.country
        };
    }),
    dimensions: {
        'start': {
            type: 'measure',
            scale: 'time'
        },
        'end': {
            type: 'measure',
            scale: 'time'
        },
        'country': {
            type: 'category',
            scale: 'ordinal'
        },
        'team': {
            type: 'category',
            scale: 'ordinal'
        }
    }
});
