tauCharts.api.plugins.add('bar-as-span', function BarAsSpan(settings) {

    var xDim0 = settings.x0;
    var yDim0 = settings.y0;

    var xTransformModel = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[xDim0]);
            }
        };
    };
    var yTransformModel = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[yDim0]);
            }
        };
    };

    var adjustModel = function (model) {

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

    return {
        onSpecReady: function (chart, specRef) {
            chart.traverseSpec(
                specRef,
                function (unit, parentUnit) {

                    if ((unit.type === 'ELEMENT.INTERVAL')) {

                        unit.transformModel = [
                            (unit.flip ? xTransformModel : yTransformModel)
                        ];

                        unit.adjustModel = [
                            adjustModel
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
        {start: '2015-02-05', end: '2015-03-12', team: 'Chelsea'},
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
