tauCharts.api.plugins.add('bar-as-span', function BarAsSpan(settings) {

    var xDim0 = settings.x0;
    var yDim0 = settings.y0;

    var transformX0 = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[xDim0]);
            }
        };
    };
    var transformY0 = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[yDim0]);
            }
        };
    };

    var adjustValueScale = function (model) {

        var data = model.data();
        if (data.length === 0) {
            return {};
        }

        var yScale = model.scaleY;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        var dim0 = (model.flip ? xDim0 : yDim0);
        var dim = yScale.dim;
        data.forEach(function (d) {
            y0 = d[dim0];
            y = d[dim];
            var min = (y0 < y ? y0 : y);
            var max = (y > y0 ? y : y0);
            minY = (min < minY ? min : minY);
            maxY = (max > maxY ? max : maxY);
        });

        yScale.fixup(function (yScaleConfig) {

            var newConf = {};

            if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < maxY) {
                newConf.max = maxY;
            }

            if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > minY) {
                newConf.min = minY;
            }

            return newConf;
        });

        return {};
    };

    var preventCollision = function (model) {

        var data = model.data().slice();
        var xScale = model.scaleX;
        var yScale = model.scaleY;

        if (data.length === 0 || !xScale.discrete) {
            return {};
        }

        var dim0 = (model.flip ? xDim0 : yDim0);
        var dim = yScale.dim;
        data.sort(utils.createMultiSorter(
            (a, b) => (a[dim0] - b[dim0]),
            (a, b) => (a[dim] - b[dim]),
        ));

        var catDim = xScale.dim;
        var categories = xScale.domain();
        var categoryLines = categories.reduce((map, c) => {
            map[c] = [];
            return map;
        }, {});
        var itemLine = new Map();
        data.forEach(function (d) {
            // Todo: optimize.
            var cat = d[catDim];
            var lines = categoryLines[cat];
            var lineNum = lines.findIndex((l) => l[l.length - 1][dim] <= d[dim0]);
            if (lineNum < 0) {
                lineNum = lines.length;
                lines.push([]);
            }
            lines[lineNum].push(d);
            itemLine.set(d, lineNum);
        });

        // Todo: Adjust ordinal scale step size (ratio function).

        return {
            xi: (row) => {
                var cat = row[catDim];
                var catHeight = xScale.stepSize(row);
                var top = (model.xi(row) - catHeight / 2);
                var lineHeight = (catHeight / categoryLines[cat].length);
                var lineIndex = itemLine.get(row);
                return (top + lineHeight * (lineIndex + 0.5));
            }
        };
    };

    return {

        onSpecReady: function (chart, specRef) {

            chart.traverseSpec(
                specRef,
                function (unit, parentUnit) {

                    if ((unit.type === 'ELEMENT.INTERVAL')) {

                        unit.transformModel = [
                            (unit.flip ? transformX0 : transformY0),
                            preventCollision
                        ];

                        unit.adjustModel = [
                            adjustValueScale
                        ];

                        unit.guide.label = unit.guide.label || {};
                        unit.guide.label.position = unit.guide.label.position || [
                            (unit.flip ?
                                'inside-start-then-outside-end-horizontal' :
                                'inside-start-then-outside-end-vertical')
                        ];
                    }
                });
        }
    };
});

dev.spec({
    type: 'horizontal-bar',
    x: 'end',
    y: 'team',
    color: 'team',
    label: 'team',
    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('bar-as-span')({
            x0: 'start'
        })
    ],
    data: [
        {start: '2015-02-03', end: '2015-03-02', team: 'Manchester'},
        {start: '2015-03-12', end: '2015-02-01', team: 'Chelsea'},
        {start: '2015-02-17', end: '2015-02-19', team: 'Liverpool'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Aston Villa'},
        {start: '2015-02-24', end: '2015-03-03', team: 'Manchester'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Manchester'},
        {start: '2015-03-29', end: '2015-02-09', team: 'Tottenham'}
    ].map(function (data) {
        return {
            team: data.team,
            start: new Date(data.start),
            end: new Date(data.end)
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
        'team': {
            type: 'category',
            scale: 'ordinal',
            order: [
                'Aston Villa',
                'Liverpool',
                'Tottenham',
                'Chelsea',
                'Manchester'
            ]
        }
    }
});

dev.spec({
    type: 'bar',
    y: 'end',
    x: 'team',
    color: 'team',
    label: 'team',
    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('bar-as-span')({
            y0: 'start'
        })
    ],
    data: [
        {start: '2015-02-03', end: '2015-03-02', team: 'Manchester'},
        {start: '2015-03-12', end: '2015-02-01', team: 'Chelsea'},
        {start: '2015-02-17', end: '2015-02-19', team: 'Liverpool'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Aston Villa'},
        {start: '2015-03-04', end: '2015-03-10', team: 'Manchester'},
        {start: '2015-02-05', end: '2015-03-29', team: 'Tottenham'}
    ].map(function (data) {
        return {
            team: data.team,
            start: new Date(data.start),
            end: new Date(data.end)
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
        'team': {
            type: 'category',
            scale: 'ordinal',
            order: [
                'Aston Villa',
                'Liverpool',
                'Tottenham',
                'Chelsea',
                'Manchester'
            ]
        }
    }
});
