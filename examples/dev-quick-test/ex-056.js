(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    tauCharts.api.unitsRegistry.reg(
        'ELEMENT.CFD',
        {
            init: function () {
                this.node().init();
            },

            prepareData: function (screenModel) {
                var groups = _.groupBy(this.node().data(), screenModel.group);
                return Object
                    .keys(groups)
                    .sort(function (a, b) {
                        return screenModel.order(a) - screenModel.order(b);
                    })
                    .reduce(function (memo, k, i) {
                        return memo.concat([groups[k]]);
                    }, [])
                    .reduce(function (memo, fiber) {
                        fiber.forEach(function (row) {
                            screenModel.y(row);
                            screenModel.y0(row);
                        });
                        return memo.concat(fiber);
                    }, []);
            },

            createXIndex: function (data, screenModel) {
                return _(data)
                    .chain()
                    .pluck(screenModel.model.scaleX.dim)
                    .uniq(String)
                    .sortBy()
                    .map(function (date, i) {
                        return {
                            ind: i,
                            val: date,
                            pos: screenModel.model.scaleX.value(date)
                        };
                    })
                    .value();
            },

            draw: function () {

                var self = this;
                var node = this.node();
                var screenModel = node.screenModel;
                var cfg = node.config;
                var container = cfg.options.slot(cfg.uid);

                var data = this.prepareData(screenModel);
                var xIndex = this.createXIndex(data, screenModel);

                var findRangeValue = function (x) {
                    var nextItem = xIndex.find((r) => r.pos >= x);
                    var prevIndex = nextItem.ind > 0 ? (nextItem.ind - 1) : nextItem.ind;
                    var prevItem = xIndex[prevIndex];

                    return [prevItem.val, nextItem.val];
                };

                var filterValuesStack = function (val) {
                    return data.filter((row) => String(row[screenModel.model.scaleX.dim]) === String(val));
                };

                var createUpdateFunc = tauCharts.api.d3_animationInterceptor;
                var speed = self.node().config.guide.animationSpeed;

                var drawRect = function (that, id, props, data) {

                    var localSpeed = props.hasOwnProperty('speed') ? props.speed : speed;

                    var rect = that
                        .selectAll('.' + id)
                        .data(data, function (row) {
                            return row.entityState
                        });
                    rect.exit()
                        .remove();
                    rect.call(createUpdateFunc(localSpeed, null, props));
                    rect.enter()
                        .append('rect')
                        .attr({class: id})
                        .style('stroke-width', 0)
                        .call(createUpdateFunc(localSpeed, {width: 0}, props));

                    return rect;
                };

                var drawCover = function () {

                    var that = this;

                    var x = 'x';
                    var y = 'y';
                    var w = 'width';
                    var h = 'height';

                    drawRect(that, 'center', {
                            class: 'center',
                            [x]: 0,
                            [y]: 0,
                            [h]: cfg.options.height,
                            [w]: 0,
                            fill: '#c4b3e6',
                            opacity: 0.25,
                            speed: 0
                        },
                        [{}]);

                    var rect = drawRect(that, 'cover-rect', {
                            class: 'cover-rect',
                            x: 0,
                            y: 0,
                            width: cfg.options.width,
                            height: cfg.options.height,
                            opacity: 0,
                            cursor: 'pointer',
                            speed: 0
                        },
                        [{}]);

                    rect.on('mousemove', function () {
                        var e = d3.event;
                        var c = {x: e.offsetX, y: e.offsetY};

                        var range = findRangeValue(c.x);

                        var prevX = screenModel.model.scaleX(range[0]);
                        var nextX = screenModel.model.scaleX(range[1]);

                        drawRect(that, 'center', {
                                class: 'center',
                                [x]: prevX,
                                [y]: 0,
                                [h]: cfg.options.height,
                                [w]: nextX - prevX,
                                speed: 0
                            },
                            [{}]);
                    });

                    rect.on('click', function () {
                        var e = d3.event;
                        var c = {x: e.offsetX, y: e.offsetY};

                        var range = findRangeValue(c.x);
                        var prevValue = range[0];
                        var nextValue = range[1];
                        var nextValues = filterValuesStack(nextValue);
                        var prevValues = filterValuesStack(prevValue);

                        //var topItem = nextValues
                        //    .map((row) => ({x: screenModel.x(row), y: screenModel.y(row)}))
                        //    .sort((a, b) => a.y - b.y)
                        //    [0];
                        //var pageX = e.pageX - e.offsetX + topItem.x;
                        //var pageY = e.pageY - e.offsetY + topItem.y;

                        var pageX = e.pageX + 10;
                        var pageY = e.pageY + 15;

                        var prevStack = prevValues.reduce(
                            (memo, item) => {
                                memo[item.entityState] = item.count;
                                return memo;
                            },
                            {date: prevValue});

                        var nextStack = nextValues.reduce(
                            (memo, item) => {
                                memo[item.entityState] = item.count;
                                return memo;
                            },
                            {date: nextValue});

                        node.fire('focus', {
                            data: nextStack,
                            prev: prevStack,
                            event: _.defaults(
                                {
                                    pageX: pageX,
                                    pageY: pageY
                                },
                                e)
                        });
                    });
                };

                var cover = container
                    .selectAll('.cover')
                    .data([1]);
                cover
                    .exit()
                    .remove();
                cover
                    .call(drawCover);
                cover
                    .enter()
                    .append('g')
                    .attr('class', 'cover')
                    .call(drawCover);
            }
        },
        'ELEMENT.GENERIC.CARTESIAN');

    function cfd() {

        return {

            init: function (chart) {
                this._chart = chart;
                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 3,
                        place: 'bottom-right',
                        auto: true,
                        effectClass: 'fade'
                    });
            },

            onSpecReady: function (chart, specRef) {

                chart.traverseSpec(
                    specRef,
                    function (unit, parentUnit) {

                        if (unit.type !== 'ELEMENT.AREA') {
                            return;
                        }

                        var over = JSON.parse(JSON.stringify(unit));
                        over.type = 'ELEMENT.CFD';
                        over.namespace = 'cfd';

                        parentUnit.units.push(over);
                    });
            },

            getContent: function(dateRange, states) {
                var str = [];
                var max = Math.max.apply(null, _(states).pluck('value'));
                str.push('<div style="padding: 5px">');
                str.push('<strong>');
                str.push(d3.time.format('%d %b')(dateRange[0]));
                str.push(' - ');
                str.push(d3.time.format('%d %b %Y')(dateRange[1]));
                str.push('</strong>');
                str.push('<table cellpadding="0" cellspacing="1" border="0">');
                str = str.concat(states.map(function (s) {
                    return [
                        '<tr>',
                        '<td>' + s.name + '</td>',
                        '<td>',
                        '<div style="padding:2px 0 2px 2px;width:' + (50 * s.value / max) + 'px;background-color:' + s.color + ';">',
                        (s.value),
                        '</div>',
                        '</td>',
                        '<td style="padding-left: 5px; text-align: right;color:' + (s.diff > 0 ? 'green' : 'red') + '">',
                        '<div style="padding:2px 0 2px 2px;">',
                        (s.diff > 0 ? '&uarr;' : (s.diff < 0 ? '&darr;' : '')),
                        (s.diff === 0 ? '' : ('&nbsp;' + Math.abs(s.diff))),
                        '</div>',
                        '</td>',
                        '</tr>'
                    ].join('');
                }));
                str.push('</table>');
                str.push('</div>');
                return str.join('');
            },

            onRender: function (chart) {
                var self = this;
                var cfd = chart.select((node) => node.config.type === 'ELEMENT.CFD')[0];
                cfd.on('focus', function (sender, e) {
                    var categories = sender.screenModel.model.scaleColor.domain();
                    var states = categories
                        .map(function (cat) {
                            var curr = e.data[cat] || 0;
                            var prev = e.prev[cat] || 0;
                            return {
                                name: cat,
                                color: sender.screenModel.model.scaleColor.value(cat),
                                value: curr,
                                diff: curr - prev
                            };
                        })
                        .reverse();

                    self._tooltip
                        .content(self.getContent([e.prev.date, e.data.date], states))
                        .show(e.event.pageX, e.event.pageY);
                });
            }
        };
    }

    tauCharts.api.plugins.add('cfd', cfd);

    return cfd;
});