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

            draw: function () {

                var node = this.node();
                var cfg = this.node().config;
                var container = cfg.options.slot(cfg.uid);

                var self = this;
                var screenModel = this.node().screenModel;

                var groups = _.groupBy(node.data(), screenModel.group);
                var data = Object
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

                var xIndex = _(data)
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

                var findNearestValue = function (x) {

                    var upperItem = xIndex.find(function (r) {
                        return r.pos >= x;
                    });

                    var lowerItem = (upperItem.ind > 0) ?
                        xIndex[upperItem.ind - 1] :
                        upperItem;

                    var nearest = _([lowerItem, upperItem])
                        .sortBy(function (item) {
                            return Math.abs(item.pos - x);
                        })
                        [0];

                    return nearest;
                };

                var filterValuesStack = function (val) {
                    var part = data
                        .filter(function (row) {
                            return String(row[screenModel.model.scaleX.dim]) === String(val);
                        });

                    return part;
                };

                var createUpdateFunc = tauCharts.api.d3_animationInterceptor;
                var speed = self.node().config.guide.animationSpeed;

                var drawPart = function (that, id, props, data) {

                    var localSpeed = props.hasOwnProperty('speed') ? props.speed : speed;

                    var part = that
                        .selectAll('.' + id)
                        .data(data, function (row) {
                            return row.entityState
                        });
                    part.exit().remove();
                    part.call(createUpdateFunc(localSpeed, null, props));
                    part.enter()
                        .append('rect')
                        .attr({class: id})
                        .style('stroke-width', 0)
                        .call(createUpdateFunc(localSpeed, {width: 0}, props));
                };

                var callPlaceholder = function () {
                    this.attr({
                        x: 0,
                        y: 0,
                        width: cfg.options.width,
                        height: cfg.options.height,
                        fill: '#fff',
                        opacity: 0.1
                    });
                };

                var drawElement = function () {

                    var that = this;

                    var rect = this
                        .selectAll('.placeholder')
                        .data([1]);
                    rect.exit().remove();
                    rect.call(callPlaceholder);
                    rect.enter()
                        .append('rect')
                        .attr('class', 'placeholder')
                        .call(callPlaceholder);

                    rect.on('click', function () {
                        var e = d3.event;
                        var c = {
                            x: e.offsetX,
                            y: e.offsetY
                        };

                        var xItem = findNearestValue(c.x);
                        var xValue = xItem.val;

                        var currValues = filterValuesStack(xValue);
                        var currStack = currValues.reduce(function (memo, item) {
                            memo[item.entityState] = item.count;
                            return memo;
                        }, {endDate: xValue});

                        var prevIndex = xItem.ind > 0 ? (xItem.ind - 1) : xItem.ind;
                        var prevValue = xIndex[prevIndex].val;
                        var prevValues = filterValuesStack(prevValue);
                        var prevStack = prevValues.reduce(function (memo, item) {
                            memo[item.entityState] = item.count;
                            return memo;
                        }, {endDate: prevValue});


                        var x = 'x';
                        var y = 'y';
                        var y0 = 'y0';
                        var w = 'width';
                        var h = 'height';

                        drawPart(
                            that,
                            'bar',
                            {
                                [w]: 5,
                                [h]: ((d) => Math.abs(screenModel[y](d) - screenModel[y0](d))),
                                [x]: ((d) => screenModel[x](d) - 0.25),
                                [y]: ((d) => Math.min(screenModel[y](d), screenModel[y0](d))),
                                fill: ((d) => screenModel.color(d)),
                                class: ((d) => `bar ${screenModel.class(d)}`)
                            },
                            currValues);

                        var topItem = currValues
                            .map(function (row) {
                                return {
                                    x: screenModel.x(row),
                                    y: screenModel.y(row)
                                }
                            })
                            .sort(function (a, b) {
                                return a.y - b.y;
                            })
                            [0];

                        var pageX = e.pageX - e.offsetX + topItem.x;
                        var pageY = e.pageY - e.offsetY + topItem.y;

                        node.fire('focus', {
                            data: currStack,
                            prev: prevStack,
                            event: _.defaults(
                                {
                                    pageX: pageX + 8,
                                    pageY: pageY
                                },
                                e)
                        });
                    });

                    rect.on('mouseout', function () {
                        console.log('mouseout');
                        that.select('.tbar')
                            .attr({opacity: 0.1});
                    });
                    rect.on('mousemove', function () {
                        var e = d3.event;
                        var c = {
                            x: e.offsetX,
                            y: e.offsetY
                        };

                        var xItem = findNearestValue(c.x);
                        var xValue = xItem.val;

                        var currValues = filterValuesStack(xValue);
                        var currStack = currValues.reduce(function (memo, item) {
                            memo[item.entityState] = item.count;
                            return memo;
                        }, {endDate: xValue});

                        var x = 'x';
                        var y = 'y';
                        var y0 = 'y0';
                        var w = 'width';
                        var h = 'height';

                        drawPart(
                            that,
                            'tbar',
                            {
                                [w]: 1,
                                [h]: cfg.options.height,
                                [x]: c.x - 3,
                                [y]: 0,
                                fill: 'rgb(140, 140, 140)',
                                class: 'tbar',
                                opacity: 1,
                                speed: 0
                            },
                            [1]);
                    });
                };

                var frameGroups = container
                    .selectAll('.cfd-over')
                    .data([1]);
                frameGroups
                    .exit()
                    .remove();
                frameGroups
                    .call(drawElement);
                frameGroups
                    .enter()
                    .append('g')
                    .attr('class', 'cfd-over')
                    .call(drawElement);
            }
        },
        'ELEMENT.GENERIC.CARTESIAN');

    function cfd(xSettings) {

        return {

            init: function (chart) {
                this._chart = chart;
                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 3,
                        place: 'top-right',
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

            getContent: function(date, states) {
                var str = [];
                var max = Math.max.apply(null, _(states).pluck('value'));
                str.push('<div style="padding: 5px">');
                str.push('<strong>' + d3.time.format('%d %B %Y')(date) + '</strong>');
                str.push('<table>');
                str = str.concat(states.map(function (s) {
                    return [
                        '<tr>',
                        '<td>' + s.name + '</td>',
                        '<td>',
                        '<div style="padding-left:2px;width:' + (50 * s.value / max) + 'px;background-color:' + s.color + ';">',
                        (s.value),
                        '</div>',
                        '</td>',
                        '<td style="padding-left: 5px; text-align: right;color:' + (s.diff > 0 ? 'green' : 'red') + '">',
                        (s.diff === 0 ? '' : s.diff),
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

                var cfd = chart.select(function (node) {
                    return node.config.type === 'ELEMENT.CFD';
                });

                cfd[0].on('focus', function (sender, e) {
                    var categories = sender.screenModel.model.scaleColor.domain();
                    var states = categories.map(function (cat) {
                        var curr = e.data[cat] || 0;
                        var prev = e.prev[cat] || 0;
                        return {
                            name: cat,
                            color: sender.screenModel.model.scaleColor.value(cat),
                            value: curr,
                            diff: curr - prev
                        };
                    });

                    var content = self.getContent(
                        e.data[sender.screenModel.model.scaleX.dim],
                        states);
                    self._tooltip.content(content);
                    self._tooltip.show(e.event.pageX, e.event.pageY);
                });
            }
        };
    }

    tauCharts.api.plugins.add('cfd', cfd);

    return cfd;
});