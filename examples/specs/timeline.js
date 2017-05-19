var timeLineData = [
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
    data: timeLineData,
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
            x0: 'start',
            collapse: false
        })
    ],
    // settings:{
    //     fitModel: 'entire-view'
    // },
    data: timeLineData,
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

dev.spec({
    type: 'bar',
    y: 'end',
    x: ['country', 'team'],
    color: 'team',
    label: 'team',
    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('bar-as-span')({
            y0: 'start'
        })
    ],
    // settings:{
    //     fitModel: 'entire-view'
    // },
    data: timeLineData,
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
