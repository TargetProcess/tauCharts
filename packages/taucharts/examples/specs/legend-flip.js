dev.spec({
    type: 'scatterplot',
    x: 'date',
    y: 'bugsCount',
    size: 'bugsCount',
    color: 'bugsCount',
    guide: {
        interpolate: 'smooth'
    },
    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
    ],
    data: [
        {date: '2017-02-11', bugsCount: 500},
        {date: '2017-02-12', bugsCount: 200},
        {date: '2017-02-13', bugsCount: 100},
        {date: '2017-02-14', bugsCount: 2000},
        {date: '2017-02-15', bugsCount: 4000}
    ]
});

dev.spec({
    type: 'scatterplot',
    x: 'date',
    y: 'income',
    size: 'income',
    color: 'income',
    guide: {
        interpolate: 'smooth'
    },
    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
    ],
    data: [
        {date: '2017-02-11', income: 4000000050},
        {date: '2017-02-12', income: 4000000200},
        {date: '2017-02-13', income: 4000000400},
        {date: '2017-02-14', income: 4000000010},
        {date: '2017-02-15', income: 4000000100}
    ]
});