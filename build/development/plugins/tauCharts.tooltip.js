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

    var dfs = function (node, predicate) {
        if (predicate(node)) {
            return node;
        }
        var i, children = node.units || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = dfs(child, predicate);
            if (found) {
                return found;
            }
        }
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
                    .append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('class', color)
                    .attr('r', 4);
                this.circle.node().addEventListener('mouseover', function () {
                    clearTimeout(this._timeoutHideId);
                }.bind(this), false);
                this.circle.node().addEventListener('mouseleave', function () {
                    this._hide();
                }.bind(this), false);
            },
            formatters: {},
            labels: {},

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

                var spec = chart.getConfig(); // .spec;

                var dimensionGuides = this._findDimensionGuides(spec);

                var lastGuides = _.reduce(dimensionGuides, function (memo, guides, key) {
                    memo[key] = _.last(guides);
                    return memo;
                }, {});
                var formatters = this._generateDefaultFormatters(lastGuides, spec.scales);
                _.extend(this.formatters, formatters);

                var labels = this._generateDefaultLabels(lastGuides);
                _.extend(this.labels, labels);

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
                this.afterInit(this._elementTooltip);
            },

            afterInit: function (elementTooltip) {

            },

            onUnitDraw: function (chart, unitMeta) {
                if (tauCharts.api.isChartElement(unitMeta)) {
                    var key = this._generateKey(unitMeta.config.options.uid);
                    this._unitMeta[key] = unitMeta;
                    var values = unitMeta.config.frames.reduce(function (data, item) {
                        return data.concat(item.data)
                    }, []);
                    this._dataWithCoords[key] = values.map(function (item) {
                        return {
                            x: unitMeta.xScale(item[unitMeta.xScale.dim]),
                            y: unitMeta.yScale(item[unitMeta.yScale.dim]),
                            item: item
                        };
                    }, this);

                }
            },

            renderItem: function (label, formattedValue, field, rawValue) {
                return this._templateItem({
                    label: label,
                    value: formattedValue
                });
            },

            render: function (data, fields) {
                fields = _.unique(fields);
                return fields.map(function (field) {
                    var rawValue = data[field];
                    var value = this._getFormatter(field)(rawValue);
                    var formattedValue = _.isObject(value) ? value.name : value;
                    var label = this._getLabel(field);

                    return this.renderItem(label, formattedValue, field, rawValue);
                }, this).join('');
            },
            afterRender: function (toolteipElement) {

            },

            onRender: function (chart) {
                if (_.isFunction(this._getDataFields)) {
                    this._dataFields = this._getDataFields(chart);
                }
                this._hide();
            },

            _getFormatter: function (field) {
                return this.formatters[field] || _.identity;
            },
            _getLabel: function (field) {
                return this.labels[field] || field;
            },

            _generateDefaultLabels: function (lastGuides) {
                return _.reduce(lastGuides, function (memo, lastGuide, key) {
                    if (lastGuide.label) {
                        memo[key] = lastGuide.label;
                        if (lastGuide.label.hasOwnProperty('text')) {
                            memo[key] = lastGuide.label.text;
                        }
                    } else {
                        memo[key] = key;
                    }
                    return memo;
                }, {});
            },

            _generateDefaultFormatters: function (lastGuides, dimensions) {
                return _.reduce(lastGuides, function (memo, lastGuide, key) {
                    var getValue = function (rawValue) {
                        if (rawValue == null) {
                            return null;
                        } else {
                            var format = lastGuide.tickPeriod || lastGuide.tickFormat;
                            if (format) {
                                // very special case for dates
                                var xFormat = (format === 'x-time-auto') ? 'day' : format;
                                return tauCharts.api.tickFormat.get(xFormat)(rawValue);
                            } else {
                                return rawValue;
                            }
                            /*else if (lastGuide.tickLabel) {
                             return rawValue[lastGuide.tickLabel];
                             } else if (dimensions[key] && dimensions[key].value) {
                             return rawValue[dimensions[key].value];
                             }*/
                        }
                    };

                    memo[key] = function (rawValue) {
                        var value = getValue(rawValue);
                        return value == null ? 'No ' + lastGuide.label : value;
                    };

                    return memo;
                }, {});
            },

            _findDimensionGuides: function (spec) {
                var dimensionGuideMap = {};
                var scales = spec.scales;
                var collect = function (field, unit) {
                    var property = unit[field];
                    if (property) {
                        var guide = (unit.guide || {})[field];
                        var dim = scales[property].dim;
                        if (dim && guide) {
                            if (!dimensionGuideMap[dim]) {
                                dimensionGuideMap[dim] = [];
                            }

                            dimensionGuideMap[dim].push(guide);
                        }
                    }
                };

                dfs(spec.unit, function (unit) {
                    collect('x', unit);
                    collect('y', unit);
                    collect('color', unit);
                    collect('size', unit);

                    return false;
                });

                return dimensionGuideMap;

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

                var fields = [unit.size && unit.size.dim, unit.color && unit.color.dim];
                var x = [];
                var y = [];
                while (unit = unit.parentUnit) {
                    x.push(unit.xScale.dim);
                    y.push(unit.yScale.dim);
                }

                return _.compact(fields.concat(y, x).reverse());

            },
            _handleLineElement: function (data, key, mouseCoord) {
                var elementData = data.elementData;
                var dataWithCoord = this._dataWithCoords[key];
                var filteredData = dataWithCoord.filter(function (value) {
                    return _.contains(elementData.data, value.item);
                });
                if (filteredData.length === 1) {
                    return filteredData[0].item;
                }
                var nearLine = _.reduce(filteredData, function (memo, point, index, data) {
                    var secondPoint;
                    if ((index + 1) === data.length) {
                        var temp = point;
                        point = data[index - 1];
                        secondPoint = temp;
                    } else {
                        secondPoint = data[index + 1];
                    }
                    var h = this._calculateLengthToLine(
                        point.x,
                        point.y,
                        secondPoint.x,
                        secondPoint.y,
                        mouseCoord[0],
                        mouseCoord[1]
                    );
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
                    return this._calculateLength(a.x, a.y, mouseCoord[0], mouseCoord[1]);
                }, this);
                this._drawPoint(
                    d3.select(data.element.parentNode),
                    itemWithCoord.x,
                    itemWithCoord.y,
                    this._unitMeta[key].color(data.elementData.tags[this._unitMeta[key].color.dim])
                );
                return itemWithCoord.item;
            },
            _onElementMouseOver: function (chart, data, mouseCoord, placeCoord) {
                clearTimeout(this._timeoutHideId);
                var key = this._generateKey(data.unit && data.unit.config.options.uid);
                var item = data.elementData;
                if (tauCharts.api.isLineElement(data.unit)) {
                    item = this._handleLineElement(data, key, mouseCoord)
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