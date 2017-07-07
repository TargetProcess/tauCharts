function utcDate(year, month, day, hours, minutes) {
    return new Date(Date.UTC.apply(null, arguments));
}

dev.spec({
    type: 'scatterplot',
    x: 'x',
    y: 'y',
    guide: {
        x: {
            timeInterval: 'day'
        }
    },
    settings: {
        utcTime: true
    },
    data: [
        {x: utcDate(2017, 1, 11, 12, 0), y: 10},
        {x: utcDate(2017, 1, 11, 21, 0), y: 20},
        {x: utcDate(2017, 1, 12, 0, 0), y: 10},
        {x: utcDate(2017, 1, 12, 3, 0), y: 20},
        {x: utcDate(2017, 1, 13, 6, 0), y: 30}
    ],
    plugins: [
        Taucharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'x',
                    val: utcDate(2017, 1, 12, 0, 0),
                    text: 'one',
                    color: 'red'
                }
            ]
        })
    ]
});

dev.spec({
    type: 'scatterplot',
    x: 'x',
    y: 'y',
    guide: {
        x: {
            timeInterval: 'day'
        }
    },
    settings: {
        utcTime: true
    },
    data: [
        {x: utcDate(2017, 1, 11, 12, 0), y: 10},
        {x: utcDate(2017, 1, 11, 21, 0), y: 20},
        {x: utcDate(2017, 1, 12, 0, 0), y: 10},
        {x: utcDate(2017, 1, 12, 3, 0), y: 20},
        {x: utcDate(2018, 1, 13, 6, 0), y: 30}
    ],
    plugins: [
        Taucharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'x',
                    val: utcDate(2017, 1, 12, 0, 0),
                    text: 'one',
                    color: 'red'
                }
            ]
        })
    ]
});