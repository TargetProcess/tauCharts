function utcDate(year, month, day, hours, minutes) {
    return new Date(Date.UTC(year, month, day, hours, minutes));
}

dev.spec({
    type: 'bar',
    x: 'x',
    y: 'y',
    label: 'x',
    guide: {
        label: {
            tickFormat: 'day'
        }
    },
    settings: {
        utcTime: true
    },
    data: [
        {x: utcDate(2017, 1, 11, 12, 0), y: 10},
        {x: utcDate(2017, 1, 11, 21, 0), y: 20},
        {x: utcDate(2017, 1, 12, 0, 0), y: 10},
        {x: utcDate(2017, 1, 12, 3, 0), y: 20}
    ]
});

dev.spec({
    type: 'bar',
    x: 'x',
    y: 'y',
    guide: {
        x: {
            tickPeriod: 'day'
        }
    },
    dimensions: {
        x: {type: 'order', scale: 'period'},
        y: {type: 'measure', scale: 'linear'}
    },
    settings: {
        utcTime: true
    },
    data: [
        {x: utcDate(2017, 1, 11, 12, 0), y: 10},
        {x: utcDate(2017, 1, 11, 21, 0), y: 20},
        {x: utcDate(2017, 1, 12, 0, 0), y: 10},
        {x: utcDate(2017, 1, 12, 3, 0), y: 20}
    ]
});
