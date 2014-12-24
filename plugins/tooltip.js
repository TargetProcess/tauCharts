(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory();
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {
    /** @class Tooltip
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
     accepts a list of data fields names as properties
     */
    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;
    var dim = function (x0, x1, y0, y1) {
        return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    };

    function tooltip(settings) {
        settings = settings || {};
        return {
            template: [
                '<div class="i-role-content graphical-report__tooltip__content"></div>',
                '<div class="i-role-exclude graphical-report__tooltip__exclude">',
                    '<div class="graphical-report__tooltip__exclude__wrap">',
                        '<span class="tau-icon-close-gray"></span>Exclude',
                    '</div>',
                '</div>'
            ].join(''),
            itemTemplate: [
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join(''),
            onExcludeData: function () {

            },
            _drawPoint: function (container, x, y, color) {
                if (this.circle) {
                    this.circle.remove();
                }
                this.circle = container
                    .append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr('class', color)
                    .attr("r", 4);
                this.circle.node().addEventListener('mouseover', function () {
                    clearTimeout(this._timeoutHideId);
                }.bind(this), false);
                this.circle.node().addEventListener('mouseleave', function () {
                    this._hide();
                }.bind(this), false);
            },
            formatters: {},
            _getFormatter: function (field) {
                return this.formatters[field] || _.identity;
            },
            init: function (chart) {
                this._chart = chart;
                this._dataFields = settings.fields;
                this._getDataFields = settings.getFields;
                _.extend(this, _.omit(settings, 'fields', 'getFields'));
                this._timeoutHideId = null;
                this._dataWithCoords = {};
                this._unitMeta = {};
                this._templateItem = _.template(this.itemTemplate);
                this._tooltip = chart.addBalloon({spacing: 3, auto: true, effectClass: 'fade'});
                this._elementTooltip = this._tooltip.getElement();
                var elementTooltip = this._elementTooltip;
                elementTooltip.addEventListener('mouseover', function () {
                    clearTimeout(this._timeoutHideId);
                }.bind(this), false);
                elementTooltip.addEventListener('mouseleave', function () {
                    this._hide();
                }.bind(this), false);
                elementTooltip.addEventListener('click', function (e) {
                    var target = e.target;
                    while (target !== e.currentTarget && target !== null) {
                        if (target.classList.contains('i-role-exclude')) {
                            this._exclude();
                            this._hide();
                        }
                        target = target.parentNode;
                    }
                }.bind(this), false);
                elementTooltip.insertAdjacentHTML('afterbegin', this.template);
            },
            onUnitReady: function (chart, unitMeta) {
                if (unitMeta.type && unitMeta.type.indexOf('ELEMENT') === 0) {
                    var key = this._generateKey(unitMeta.$where);
                    this._unitMeta[key] = unitMeta;
                    var values = unitMeta.partition();
                    this._dataWithCoords[key] = values.map(function (item) {
                        return {
                            x: unitMeta.options.xScale(item[unitMeta.x.scaleDim]),
                            y: unitMeta.options.yScale(item[unitMeta.y.scaleDim]),
                            item: item
                        };
                    }, this);

                }
            },
            render: function (data, fields) {
                fields = _.unique(fields);
                return fields.map(function (field) {
                    var v = data[field];
                    var value = (_.isNull(v) || _.isUndefined(v)) ? ('No ' + field) : v;
                    return this._templateItem({
                        label: field,
                        value: this._getFormatter(field)(value)
                    });
                }, this).join('');
            },
            onRender: function (chart) {
                if (_.isFunction(this._getDataFields)) {
                    this._dataFields = this._getDataFields(chart);
                }
                this._hide();
            },
            _exclude: function () {
                this._chart.addFilter({
                    tag: 'exclude',
                    predicate: (function (element) {
                        return function (item) {
                            return JSON.stringify(item) !== JSON.stringify(element);
                        };
                    }(this._currentElement))
                });
                this.onExcludeData(this._currentElement);
            },
            _calculateLength: function (x1, y1, x2, y2) {
                return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            },
            _calculateLengthToLine: function (x0, y0, x1, y1, x2, y2) {
                var a1 = {x: (x1 - x0), y: (y1 - y0)};
                var b1 = {x: (x2 - x0), y: (y2 - y0)};
                var a1b1 = a1.x * b1.x + a1.y * b1.y;
                if (a1b1 < 0) {
                    return dim(x0, x2, y0, y2);
                }

                var a2 = {x: (x0 - x1), y: (y0 - y1)};
                var b2 = {x: (x2 - x1), y: (y2 - y1)};
                var a2b2 = a2.x * b2.x + a2.y * b2.y;
                if (a2b2 < 0) {
                    return dim(x1, x2, y1, y2);
                }

                return Math.abs(((x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0)) / dim(x0, x1, y0, y1));
            },
            _generateKey: function (data) {
                return JSON.stringify(data);
            },
            _getFields: function (unit) {
                if (this._dataFields) {
                    return this._dataFields;
                }

                var fields = [unit.size && unit.size.scaleDim, unit.color && unit.color.scaleDim];
                var x = [];
                var y = [];
                while (unit = unit.parentUnit) {
                    x.push(unit.x.scaleDim);
                    y.push(unit.y.scaleDim);
                }

                return _.compact(fields.concat(y, x).reverse());

            },
            isLine: function (data) {
                return data.elementData.key && Array.isArray(data.elementData.values);
            },
            _onElementMouseOver: function (chart, data, mosueCoord, placeCoord) {
                clearTimeout(this._timeoutHideId);
                var key = this._generateKey(data.cellData.$where);
                var item = data.elementData;
                var isLine = this.isLine(data);
                if (isLine) {
                    var dataWithCoord = this._dataWithCoords[key];
                    var filteredData = dataWithCoord.filter(function (value) {
                        return _.contains(item.values, value.item);
                    });
                    var nearLine = _.reduce(filteredData, function (memo, point, index, data) {
                        var secondPoint;
                        if ((index + 1) === data.length) {
                            var temp = point;
                            point = data[index - 1];
                            secondPoint = temp;
                        } else {
                            secondPoint = data[index + 1];
                        }
                        var h = this._calculateLengthToLine(point.x, point.y, secondPoint.x, secondPoint.y, mosueCoord[0], mosueCoord[1]);
                        if (h < memo.h) {
                            memo.h = h;
                            memo.points = {
                                point1: point,
                                point2: secondPoint
                            };
                        }
                        return memo;
                    }.bind(this), {h: Infinity, points: {}});

                    var itemWithCoord = _.min(nearLine.points, function (a) {
                        return this._calculateLength(a.x, a.y, mosueCoord[0], mosueCoord[1]);
                    }, this);
                    item = itemWithCoord.item;
                    this._drawPoint(d3.select(data.element.parentNode), itemWithCoord.x, itemWithCoord.y, this._unitMeta[key].options.color.get(data.elementData.key));
                }
                if (this._currentElement === item) {
                    return;
                }
                var content = this._elementTooltip.querySelectorAll('.i-role-content');
                if (content[0]) {
                    var fields = this._getFields(this._unitMeta[key]);
                    content[0].innerHTML = this.render(item, fields);
                } else {
                    console.log('template should contain i-role-content class');
                }

                this._show(placeCoord);
                this._currentElement = item;
            },
            onElementMouseOver: function (chart, data) {
                var placeCoord = d3.mouse(document.body);
                var coord = d3.mouse(data.element);
                clearTimeout(this._timeoutShowId);
                this._timeoutShowId = _.delay(this._onElementMouseOver.bind(this), 200, chart, data, coord, placeCoord);
            },
            onElementMouseOut: function (mouseСoord, placeCoord) {
                this._hide();
            },
            _show: function (placeCoord) {
                this._tooltip.show(placeCoord[0], placeCoord[1]).updateSize();
            },
            _hide: function () {
                clearTimeout(this._timeoutShowId);
                this._timeoutHideId = setTimeout(function () {
                    this._currentElement = null;
                    this._tooltip.hide();
                    if (this.circle) {
                        this.circle.remove();
                    }
                }.bind(this), 300);
            },
            _destroyTooltip: function () {
                if (this.circle) {
                    this.circle.remove();
                }
                this._tooltip.destroy();
            },
            destroy: function () {
                this._destroyTooltip();
            }
        };

    }

    tauCharts.api.plugins.add('tooltip', tooltip);
    return tooltip;
});