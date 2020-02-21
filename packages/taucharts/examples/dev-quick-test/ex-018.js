dev.spec({

    layoutEngine: 'DEFAULT',
    data: [
        {xdate: +new Date('2013-12-01T00:00:00Z'), count: 31},
        {xdate: +new Date('2014-01-01T00:00:00Z'), count: 27},
        {xdate: +new Date('2014-02-01T00:00:00Z'), count: 22},
        {xdate: +new Date('2014-03-01T00:00:00Z'), count: 13},
        {xdate: +new Date('2014-04-01T00:00:00Z'), count: 9},
        {xdate: +new Date('2014-05-01T00:00:00Z'), count: 5},
        {xdate: +new Date('2014-06-01T00:00:00Z'), count: 1},
        {xdate: +new Date('2014-07-01T00:00:00Z'), count: -3},
        {xdate: +new Date('2014-08-01T00:00:00Z'), count: -5},
        {xdate: +new Date('2014-09-01T00:00:00Z'), count: -7},
        {xdate: +new Date('2014-10-01T00:00:00Z'), count: -9},
        {xdate: +new Date('2014-11-01T00:00:00Z'), count: -11},
        {xdate: +new Date('2014-12-01T00:00:00Z'), count: -17},
        {xdate: +new Date('2015-01-01T00:00:00Z'), count: -27},
        {xdate: +new Date('2015-02-01T00:00:00Z'), count: -53}
    ].map(function(x) {
            x.xdate = x.xdate + (new Date()).getTimezoneOffset() * 60 * 1000;
            return x;
        }),

    spec: {
        dimensions: {
            xdate: {type: 'order', scale: 'period'},
            count: {type: 'measure'}
        },
        unit: {
            type: 'COORDS.RECT',
            guide: {
                x: {
                    tickPeriod: 'month'
                }
            },
            x: 'xdate',
            y: 'count',
            unit: [
                { type: 'ELEMENT.LINE' }
            ]
        }
    },
    plugins: [
        Taucharts.api.plugins.get('trendline')(),
        Taucharts.api.plugins.get('tooltip')({fields:['count']})
    ]

});