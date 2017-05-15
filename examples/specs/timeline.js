tauCharts.api.plugins.add('bar-as-span', function BarAsSpan(settings) {
    var x0 = settings.x0;
    var y0 = settings.y0;

    var horizontalModel = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[x0]);
            }
        };
    };
    var verticalModel = function (model) {
        return {
            x0: function x0(dataRow) {
                return model.scaleX.value(dataRow[y0]);
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
                            (unit.flip ? horizontalModel : verticalModel)
                        ];

                        unit.adjustModel = [
                            function (model) {

                                var data = model.data();
                                if (data.length === 0) {
                                    return {};
                                }

                                var yScale = model.scaleY;
                                var minY = Number.MAX_VALUE;
                                var maxY = Number.MIN_VALUE;
                                data.forEach(function (d) {
                                    var y0 = yScale.value.invert(model.y0(d));
                                    var y = yScale.value.invert(model.yi(d));
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
                            }
                        ];

                        unit.guide.label = unit.guide.label || {};
                        unit.guide.label.position = unit.guide.label.position || [
                            'inside-start-then-outside-end'
                            // 'reverse',
                            // 'r+'
                            // // 'l'
                            // 'reverse',
                            // 'outside-then-inside-horizontal'
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
        { start: '2015-02-03', end: '2015-03-02', team: 'Manchester' },
        { start: '2015-02-05', end: '2015-03-12', team: 'Chelsea' },
        { start: '2015-02-17', end: '2015-02-24', team: 'Liverpool' },
        { start: '2015-03-04', end: '2015-03-07', team: 'Aston Villa' },
        { start: '2015-02-05', end: '2015-03-29', team: 'Tottenham' }
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
