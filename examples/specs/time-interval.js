function utcDate(year, month, day, hours, minutes) {
    return new Date(Date.UTC.apply(null, arguments));
}

var timeIntervalSpecTemplate = {
    type: 'bar',
    x: 'x',
    y: 'y',
    plugins: [
        Taucharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'x',
                    val: utcDate(2017, 1, 12, 0, 0),
                    text: 'one',
                    color: 'orange'
                }
            ]
        })
    ]
};

function getTimeIntervalSpec(ext) {
    return Object.assign({}, timeIntervalSpecTemplate, ext);
}

const timeIntervalData = [
    {x: utcDate(2017, 1, 11, 12, 0), y: 10},
    {x: utcDate(2017, 1, 11, 21, 0), y: 20},
    {x: utcDate(2017, 1, 12, 0, 0), y: 10},
    {x: utcDate(2017, 1, 12, 3, 0), y: 20},
    {x: utcDate(2017, 1, 13, 6, 0), y: 30}
];

dev.spec(getTimeIntervalSpec({
    guide: {
        x: {
            timeInterval: 'day'
        }
    },
    settings: {
        utcTime: true
    },
    data: timeIntervalData
}));

dev.spec(getTimeIntervalSpec({
    guide: {
        x: {
            timeInterval: 'day'
        }
    },
    settings: {
        utcTime: true
    },
    data: timeIntervalData.concat(
        {x: utcDate(2018, 1, 13, 6, 0), y: 30}
    )
}));

dev.spec(getTimeIntervalSpec({
    guide: {
        x: {
            timeInterval: 'month'
        }
    },
    settings: {
        utcTime: true
    },
    data: timeIntervalData
}));
