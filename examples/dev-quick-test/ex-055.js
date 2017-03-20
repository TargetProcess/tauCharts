(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['taucharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('taucharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;
    var createUpdateFunc = tauCharts.api.d3_animationInterceptor;

    var drawRect = function (container, id, props) {

        var localSpeed = props.hasOwnProperty('speed') ? props.speed : 0;

        var rect = container
            .selectAll('.' + id)
            .data([1]);
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

    tauCharts.api.unitsRegistry.reg(
        'ELEMENT.CFD',
        {
            addInteraction: function () {
                var node = this.node();
                this.cover = null;
                this.freeze = false;
                this.activeRange = [];
                node.on('range-freeze', function (_, e) { this.freeze = e; }.bind(this));
                node.on('range-blur', function () {
                    this.activeRange = [];
                    drawRect(this.cover, 'cursor', {width: 0})
                }.bind(this));
            },

            prepareData: function (screenModel) {
                var groups = utils.groupBy(this.node().data(), screenModel.group);
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
                return utils.unique(data.map(function (x) {
                        return x[screenModel.model.scaleX.dim];
                    }), String)
                    .sort(function(x1, x2) {
                        return x1 - x2;
                    })
                    .map(function (date, i) {
                        return {
                            ind: i,
                            val: date,
                            pos: screenModel.model.scaleX.value(date)
                        };
                    });
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
                    var nextItem = xIndex.find(function (r) {
                        return r.pos >= x;
                    });
                    var prevIndex = nextItem.ind > 0 ? (nextItem.ind - 1) : nextItem.ind;
                    var prevItem = xIndex[prevIndex];
                    return [prevItem.val, nextItem.val];
                };

                var filterValuesStack = function (x) {
                    return data.filter(function (row) {
                        return String(row[screenModel.model.scaleX.dim]) === String(x);
                    });
                };

                var drawCover = function () {

                    var that = this;

                    drawRect(that, 'cursor', {
                        class: 'cursor',
                        x: 0,
                        y: 0,
                        height: cfg.options.height,
                        width: 0,
                        fill: '#c4b3e6',
                        opacity: 0.25,
                        speed: 0
                    });

                    var rect = drawRect(that, 'cover-rect', {
                        class: 'cover-rect',
                        x: 0,
                        y: 0,
                        width: cfg.options.width,
                        height: cfg.options.height,
                        opacity: 0,
                        cursor: 'pointer',
                        speed: 0
                    });

                    rect.on('mouseleave', function () {
                        setTimeout(function () {
                            if (!self.freeze) {
                                node.fire('range-blur');
                            }
                        }, 100);
                    });

                    rect.on('mousemove', function () {
                        var e = d3.event;
                        var c = {x: e.offsetX, y: e.offsetY};

                        var range = findRangeValue(c.x);

                        if (JSON.stringify(self.activeRange) === JSON.stringify(range)) {

                            node.fire('range-active', {
                                data: range,
                                event: e
                            });

                            return;
                        }

                        self.activeRange = range;

                        var prevX = screenModel.model.scaleX(range[0]);
                        var nextX = screenModel.model.scaleX(range[1]);

                        drawRect(that, 'cursor', {
                            x: prevX,
                            width: nextX - prevX,
                            speed: 0
                        });

                        node.fire('range-changed', {
                            data: range,
                            event: e
                        });
                    });

                    rect.on('click', function () {
                        var e = d3.event;
                        var c = {x: e.offsetX, y: e.offsetY};

                        var range = findRangeValue(c.x);
                        var prevValue = range[0];
                        var nextValue = range[1];
                        var nextValues = filterValuesStack(nextValue);
                        var prevValues = filterValuesStack(prevValue);

                        var prevStack = prevValues.reduce(
                            function (memo, item) {
                                memo[item.entityState] = item.count;
                                return memo;
                            },
                            {date: prevValue});

                        var nextStack = nextValues.reduce(
                            function (memo, item) {
                                memo[item.entityState] = item.count;
                                return memo;
                            },
                            {date: nextValue});

                        node.fire('range-focus', {
                            data: nextStack,
                            prev: prevStack,
                            event: e
                        });
                    });
                };

                var cover = container
                    .selectAll('.cover')
                    .data([1]);
                this.cover = cover;
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
                var self = this;
                this._chart = chart;
                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 3,
                        place: 'bottom-right',
                        auto: true,
                        effectClass: 'fade'
                    });

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function () { self._freeze(true); }, false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function () { self._freeze(false); }, false);
            },

            destroy: function () {
                this._tooltip.destroy();
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

            formatRange: function (dateRange) {

                var d0 = d3.time.format('%d')(dateRange[0]);
                var d1 = d3.time.format('%d')(dateRange[1]);

                var m0 = d3.time.format('%b')(dateRange[0]);
                var m1 = d3.time.format('%b')(dateRange[1]);

                var y1 = d3.time.format('%Y')(dateRange[1]);
                var diff = Math.round((dateRange[1] - dateRange[0]) / 1000 / 60 / 60 / 24);

                var str = [];
                str.push(d0);
                str.push((m1 === m0) ? '' : (' ' + m0));
                str.push(' - ');
                str.push(d1 + ' ' + m1 + ' ' + y1);
                str.push(' (' + diff + ' days)');

                return str.join('');
            },

            getContent: function(dateRange, states) {
                var str = [];
                var max = Math.max.apply(null, states.map(function (state) {
                    return state['value'];
                }));
                str.push('<div style="padding: 5px">');
                str.push('<strong>');
                str.push(this.formatRange(dateRange));
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

                self._tooltip.hide();

                var cfd = chart.select(function (node) {
                    return node.config.type === 'ELEMENT.CFD';
                })[0];
                self.cfd = cfd;

                cfd.on('range-changed', function () { self._tooltip.hide(); });
                cfd.on('range-blur', function () { self._tooltip.hide(); });
                cfd.on('range-focus', function (sender, e) {
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
                        .show(e.event.pageX + 16, e.event.pageY + 16);
                });

                cfd.on('range-active', function () { clearTimeout(self._hideTooltipTimeout); });
            },

            _freeze: function (flag) {
                var cfd = this.cfd;
                cfd.fire('range-freeze', flag);
                if (!flag) {
                    this._hideTooltipTimeout = setTimeout(function () {
                        cfd.fire('range-blur');
                    }, 100);
                }
            }
        };
    }

    tauCharts.api.plugins.add('cfd', cfd);

    return cfd;
});

var cfdData = [
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 172,
        "entityStateGroup": "Sp?cification",
        "entityStateOrder": 1,
        "numericPriority": 0.75,
        "entityStateName": "Sp?cification",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Sp?cification(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 0,
        "count": 2,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 11,
        "count": 4,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 26,
        "count": 2,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-11-25T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 1,
        "effort": 0
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 8,
        "count": 3,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 11,
        "count": 2,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2015-12-02T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 3,
        "effort": 24
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 8,
        "count": 3,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2015-12-09T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 4,
        "effort": 32
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 8,
        "count": 3,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 12,
        "count": 3,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 163,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.875,
        "entityStateName": "D?ploiement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(UserStory)"
    },
    {
        "endDate": "2015-12-16T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 5,
        "effort": 35
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 8,
        "count": 1,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2015-12-23T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 9,
        "effort": 49
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 8,
        "count": 1,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2015-12-30T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 9,
        "effort": 49
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 8,
        "count": 1,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2016-01-06T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 9,
        "effort": 49
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 8,
        "count": 1,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2016-01-13T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 9,
        "effort": 49
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 13,
        "count": 3,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2016-01-20T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 11,
        "effort": 52
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 8,
        "count": 2,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2016-01-27T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 12,
        "effort": 57
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 26,
        "count": 5,
        "entityStateID": 153,
        "entityStateGroup": "A cadrer",
        "entityStateOrder": 0,
        "numericPriority": 0,
        "entityStateName": "A cadrer",
        "entityTypeName": "UserStory",
        "entityStateType": "Initial",
        "entityState": "A cadrer(UserStory)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 304,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.4375,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(Bug)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 8,
        "count": 3,
        "entityStateID": 173,
        "entityStateGroup": "Pr?t ? d?velopper",
        "entityStateOrder": 2,
        "numericPriority": 0.875,
        "entityStateName": "Pr?t ? d?velopper",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Pr?t ? d?velopper(UserStory)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 218,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 0.875,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(Bug)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 3,
        "count": 1,
        "entityStateID": 154,
        "entityStateGroup": "En d?veloppement",
        "entityStateOrder": 3,
        "numericPriority": 1,
        "entityStateName": "En d?veloppement",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "En d?veloppement(UserStory)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 219,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.25,
        "entityStateName": "Revue technique",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(Bug)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 5,
        "count": 1,
        "entityStateID": 161,
        "entityStateGroup": "Revue technique",
        "entityStateOrder": 4,
        "numericPriority": 1.5,
        "entityStateName": "Revue technique",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Revue technique(UserStory)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 167,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.5,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(Bug)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 10,
        "count": 2,
        "entityStateID": 162,
        "entityStateGroup": "Validation fonctionnelle",
        "entityStateOrder": 5,
        "numericPriority": 1.75,
        "entityStateName": "Validation fonctionnelle",
        "entityTypeName": "UserStory",
        "entityStateType": "InProgress",
        "entityState": "Validation fonctionnelle(UserStory)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "effort": 0,
        "count": 1,
        "entityStateID": 220,
        "entityStateGroup": "D?ploiement",
        "entityStateOrder": 6,
        "numericPriority": 1.75,
        "entityStateName": "D?ploiement",
        "entityTypeName": "Bug",
        "entityStateType": "InProgress",
        "entityState": "D?ploiement(Bug)"
    },
    {
        "endDate": "2016-02-01T00:00:00.000Z",
        "entityState": "Final",
        "entityStateOrder": 7,
        "count": 12,
        "effort": 57
    }
];

var orderByState = cfdData.reduce(function (memo, row) {
    memo[row.entityState] = row.entityStateOrder;
    return memo;
}, {});

var orderIndex = [
    "Final",
    "D?ploiement(Bug)",
    "D?ploiement(UserStory)",
    "Validation fonctionnelle(Bug)",
    "Validation fonctionnelle(UserStory)",
    "Revue technique(Bug)",
    "Revue technique(UserStory)",
    "En d?veloppement(Bug)",
    "En d?veloppement(UserStory)",
    "Pr?t ? d?velopper(Bug)",
    "Pr?t ? d?velopper(UserStory)",
    "Sp?cification(UserStory)",
    "A cadrer(UserStory)"
].reverse();

var orderRange = d3.extent(Object.keys(orderByState).map(function (key) {
    return orderByState[key];
}));

dev.spec({
    z: 777,
    "dimensions": {
        "endDate": {
            "type": "measure",
            "scale": "time"
        },
        "count": {
            "type": "measure",
            "scale": "linear"
        },
        "effort": {
            "type": "measure",
            "scale": "linear"
        },
        "entityState": {
            "type": "category",
            "scale": "ordinal",
            "order": [
                "Final",
                "D?ploiement(Bug)",
                "D?ploiement(UserStory)",
                "Validation fonctionnelle(Bug)",
                "Validation fonctionnelle(UserStory)",
                "Revue technique(Bug)",
                "Revue technique(UserStory)",
                "En d?veloppement(Bug)",
                "En d?veloppement(UserStory)",
                "Pr?t ? d?velopper(Bug)",
                "Pr?t ? d?velopper(UserStory)",
                "Sp?cification(UserStory)",
                "A cadrer(UserStory)"
            ]
        }
    },
    "type": "stacked-area",
    "x": "endDate",
    "guide": {
        showGridLines: 'y',
        "x": {
            "nice": false
        },
        color: {
            brewer: function (state) {
                // var stateOrder = orderByState[state];
                var stateOrder = orderIndex.indexOf(state);
                var color = d3.scale.linear()
                    .domain(splitEvenly([0, orderIndex.length], 8))
                    .range([
                        d3.hsl(260, 0.5, 0.8),
                        d3.hsl(300, 0.5, 0.8),
                        d3.hsl(340, 0.5, 0.8),
                        d3.hsl(20, 0.5, 0.8),
                        d3.hsl(60, 0.5, 0.8),
                        d3.hsl(100, 0.5, 0.8),
                        d3.hsl(140, 0.5, 0.8),
                        d3.hsl(180, 0.5, 0.8)
                    ]);

                return color(stateOrder);
            }
        }
    },
    "y": "count",
    "color": "entityState",
    plugins: [
        tauCharts.api.plugins.get('cfd')()
    ],
    "data": cfdData
});



function splitEvenly(domain, parts) {
    var min = domain[0];
    var max = domain[1];
    var segment = (max - min) / (parts - 1);
    var chunks = utils.range(parts - 2).map(function (n) {
        return min + segment * (n + 1);
    });
    return [min].concat(chunks).concat(max);
};