dev.spec({
    type: 'bar',
    x: 'date',
    y: ['team', 'effort'],
    color: 'team',
    guide: [{}, {
        x: {
            timeInterval: 'day'
        }
    }],
    settings: {
        utcTime: true
    },
    plugins: [
        Taucharts.api.plugins.get('diff-tooltip')(),
        Taucharts.api.plugins.get('crosshair')(),
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('quick-filter')(),
        Taucharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'effort',
                    val: 30,
                    text: 'Minimal',
                    color: 'orange',
                    position: 'front'
                },
                {
                    dim: 'effort',
                    val: 100,
                    text: {
                        start: '{{value}}',
                        end: 'Overflow'
                    },
                    color: 'red',
                    position: 'front'
                },
                {
                    dim: 'effort',
                    val: [50, 70],
                    text: 'Good',
                    color: 'green'
                },
                {
                    dim: 'date',
                    val: [new Date('2015-07-03'), new Date('2015-07-04')],
                    text: 'Weekends ({{value}})',
                    color: 'blue'
                },
                {
                    dim: 'date',
                    val: new Date('2015-07-02'),
                    text: 'Deadline',
                    color: 'darkred',
                    position: 'front'
                },
                {
                    dim: ['date', 'effort'],
                    val: [
                        [new Date('2015-07-01'), 50],
                        [new Date('2015-07-05'), 0],
                    ],
                    text: {
                        start: '{{x}} / {{y}}',
                        end: 'Ideal Line ({{x}})'
                    },
                    color: 'black',
                    position: 'front'
                },
                {
                    dim: ['date', 'effort'],
                    val: [new Date('2015-07-04'), 40],
                    text: 'Point',
                    color: 'black',
                    position: 'front'
                },
            ]
        })
    ],
    data: [
        {date: new Date('2015-07-01'), effort: 40, team: 'Winners'},
        {date: new Date('2015-07-02'), effort: 50, team: 'Winners'},
        {date: new Date('2015-07-03'), effort: 200, team: 'Winners'},
        {date: new Date('2015-07-04'), effort: 20, team: 'Winners'},
        {date: new Date('2015-07-05'), effort: 30, team: 'Winners'},
        {date: new Date('2015-07-01'), effort: 20, team: 'Losers'},
        {date: new Date('2015-07-02'), effort: 10, team: 'Losers'},
        {date: new Date('2015-07-03'), effort: 10, team: 'Losers'},
        {date: new Date('2015-07-04'), effort: 10, team: 'Losers'},
        {date: new Date('2015-07-05'), effort: 40, team: 'Losers'},
        {date: new Date('2015-07-06'), effort: 40, team: 'Losers'}
    ]
});
