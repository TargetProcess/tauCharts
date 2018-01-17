dev.spec({

    description: 'Generate zero data points for missing time interval',

    type: 'line',
    x: 'date',
    y: 'points',
    color: 'team',
    size: 'points',
    guide: {
        x: {
            min: new Date('2015-01-01'),
            max: new Date('2015-09-01'),
            timeInterval: 'month'
        }
    },
    plugins: [
        Taucharts.api.plugins.get('diff-tooltip')()
    ],
    settings: {
        utcTime: true
    },
    data: [

        {team: 'Manchester', date: new Date('2015-02-01'), points: 50},
        {team: 'Chelsea', date: new Date('2015-02-01'), points: 40},

        {team: 'Manchester', date: new Date('2015-03-01'), points: 60},
        {team: 'Chelsea', date: new Date('2015-03-01'), points: 50},
        {team: 'Aston Villa', date: new Date('2015-03-01'), points: -20},

        {team: 'Manchester', date: new Date('2015-04-01'), points: 60},
        {team: 'Aston Villa', date: new Date('2015-04-01'), points: 10},

        {team: 'Manchester', date: new Date('2015-05-01'), points: 50},
        {team: 'Chelsea', date: new Date('2015-05-01'), points: -40},
        {team: 'Aston Villa', date: new Date('2015-05-01'), points: 10},

        {team: 'Manchester', date: new Date('2015-06-01'), points: 30},

        {team: 'Manchester', date: new Date('2015-08-01'), points: 50},
        {team: 'Chelsea', date: new Date('2015-08-01'), points: 30},
    ]
});
