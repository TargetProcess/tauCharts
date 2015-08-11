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
    var doEven = function (n) {
        n = Math.round(n);
        return n % 2 ? n + 1 : n;
    };
    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;
    var isEmpty = function (x) {
        return (x === null) || (x === '') || (typeof x === 'undefined');
    };

    function log10(x) {
        return Math.log(x) / Math.LN10;
    }

    var legend = function () {
        return {
            _delegateEvent: function (element, eventName, selector, callback) {
                element.addEventListener(eventName, function (e) {
                    var target = e.target;
                    while (target !== e.currentTarget && target !== null) {
                        if (target.classList.contains(selector)) {
                            callback(e, target);
                        }
                        target = target.parentNode;
                    }
                });
            },
            _findUnit: function (chart) {
                var conf = chart.getConfig();
                var spec = chart.getConfig();
                var checkNotEmpty = function (dimName) {
                    var sizeScaleCfg = spec.scales[dimName];
                    return (
                    sizeScaleCfg &&
                    sizeScaleCfg.dim &&
                    sizeScaleCfg.source &&
                    spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim]
                    );
                };
                return dfs(conf.unit, function (node) {

                    if (checkNotEmpty(node.color)) {
                        return true;
                    }

                    if (checkNotEmpty(node.size)) {
                        var sizeScaleCfg = spec.scales[node.size];
                        return spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim].type === 'measure';
                    }
                });
            },
            init: function (chart) {
                if (this._isNeedLegend(chart)) {
                    this._currentFilters = {};
                    this._storageValues = {};
                    this._container = chart.insertToRightSidebar(this._containerTemplate);
                    this._delegateEvent(
                        this._container,
                        'click',
                        'graphical-report__legend__item-color',
                        function (e, currentTarget) {
                            this._toggleLegendItem(currentTarget, chart);
                        }.bind(this)
                    );

                    this._delegateEvent(
                        this._container,
                        'mouseover',
                        'graphical-report__legend__item-color',
                        function (e, currentTarget) {
                            this._highlightToggle(currentTarget, chart, true);
                        }.bind(this)
                    );
                    this._delegateEvent(
                        this._container,
                        'mouseout',
                        'graphical-report__legend__item-color',
                        function (e, currentTarget) {
                            this._highlightToggle(currentTarget, chart, false);
                        }.bind(this)
                    );
                }
            },
            _highlightToggle: function (target, chart, toggle) {

                var svg = chart.getSVG();
                var d3Chart = d3.select(svg);
                if (target.classList.contains('disabled')) {
                    toggle = false;
                }
                if (toggle) {
                    var value = target.getAttribute('data-value');
                    var originValue = this._storageValues[value];
                    var color = originValue.color;

                    d3Chart
                        .selectAll('.i-role-element')
                        .classed({'graphical-report__highlighted': false});

                    d3Chart
                        .selectAll('.i-role-element.' + color)
                        .filter(function (item) {
                            var propObject = item.data.hasOwnProperty(originValue.dimension) ?
                                item.data[originValue.dimension] :
                                item.data.tags[originValue.dimension];
                            // _.chain(item.values).pluck(originValue.dimension).unique().first().value();

                            return propObject === originValue.value;
                        })
                        .classed({'graphical-report__highlighted': true});

                    d3Chart.classed({'graphical-report__highlighted_chart': true});
                } else {
                    d3Chart.selectAll('.i-role-element').classed({'graphical-report__highlighted': false});
                    d3Chart.classed({'graphical-report__highlighted_chart': false});
                }
            },
            _toggleLegendItem: function (target, chart) {

                var value = target.getAttribute('data-value');

                var keys = _.keys(this._currentFilters);
                if (keys.length === (this._colorScaleSize - 1) && !this._currentFilters.hasOwnProperty(value)) {
                    return;
                }

                if (this._currentFilters.hasOwnProperty(value)) {
                    var currentFilterID = this._currentFilters[value];
                    delete this._currentFilters[value];
                    target.classList.remove('disabled');
                    chart.removeFilter(currentFilterID);
                } else {
                    this._currentFilters[value] = 1;
                    var originValue = this._storageValues[value];
                    var filter = {
                        tag: 'legend',
                        predicate: function (item) {
                            var propObject = item[originValue.dimension];
                            return propObject !== originValue.value;
                        }
                    };
                    target.classList.add('disabled');
                    this._currentFilters[value] = chart.addFilter(filter);
                }
                chart.refresh();
            },

            _isNeedLegend: function (chart) {
                return Boolean(this._findUnit(chart));
            },

            onUnitDraw: function (chart, unit) {
                if (tauCharts.api.isChartElement(unit)) {
                    this._unit = unit;
                }
            },

            _getColorMap: function (data, colorScale, colorDimension) {

                return _(data)
                    .chain()
                    .map(function (item) {
                        var value = item[colorDimension];
                        return {color: colorScale(value), value: value, label: value};
                    })
                    .uniq(function (legendItem) {
                        return legendItem.value;
                    })
                    .value()
                    .reduce(function (memo, item) {
                        memo.brewer[item.value] = item.color;
                        memo.values.push(item);
                        return memo;
                    },
                    {brewer: {}, values: []});
            },
            // jscs:disable maximumLineLength
            _containerTemplate: '<div class="graphical-report__legend"></div>',
            _template: _.template('<div class="graphical-report__legend"><div class="graphical-report__legend__title"><%=name%></div><%=items%></div>'),
            _itemTemplate: _.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
                '<div class="graphical-report__legend__guide__wrap"><div class="graphical-report__legend__guide <%=color%>" ></div></div><%=label%>',
                '</div>'
            ].join('')),
            _itemSizeTemplate: _.template([
                '<div class="graphical-report__legend__item graphical-report__legend__item--size">',
                '<div class="graphical-report__legend__guide__wrap">',
                '<svg class="graphical-report__legend__guide graphical-report__legend__guide--size  <%=className%>" style="width: <%=diameter%>px;height: <%=diameter%>px;"><circle cx="<%=radius%>" cy="<%=radius%>" class="graphical-report__dot" r="<%=radius%>"></circle></svg>',
                '</div><%=value%>',
                '</div>'
            ].join('')),
            // jscs:enable maximumLineLength
            _renderColorLegend: function (configUnit, chart) {
                var spec = chart.getConfig();
                var checkNotEmpty = function (dimName) {
                    var sizeScaleCfg = spec.scales[dimName];
                    return (
                    sizeScaleCfg &&
                    sizeScaleCfg.dim &&
                    sizeScaleCfg.source &&
                    spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim]
                    );
                };
                if (!checkNotEmpty(configUnit.color)) {
                    return;
                }
                var colorScale = this._unit.color;
                var colorDimension = this._unit.color.dim;
                configUnit.guide = configUnit.guide || {};
                configUnit.guide.color = configUnit.guide.color || {};

                var colorLabelText = (_.isObject(configUnit.guide.color.label)) ?
                    configUnit.guide.color.label.text :
                    configUnit.guide.color.label;

                var colorScaleName = colorLabelText || colorScale.dim;
                var colorMap = this._getColorMap(
                    chart.getData({excludeFilter: ['legend']}),
                    colorScale,
                    colorDimension
                );

                chart.configGPL.scales[this._unit.config.color].brewer = colorMap.brewer;

                var data = _.reduce(
                    colorMap.values,
                    function (data, item) {
                        var originValue = {
                            dimension: colorDimension,
                            value: item.value
                        };
                        var value = JSON.stringify(originValue);
                        var label = _.escape(isEmpty(item.label) ? ('No ' + colorScaleName) : item.label);
                        data.items.push(this._itemTemplate({
                            color: item.color,
                            classDisabled: this._currentFilters.hasOwnProperty(value) ? 'disabled' : '',
                            label: label,
                            value: _.escape(value)
                        }));
                        data.storageValues[value] = _.extend({color: item.color}, originValue);
                        return data;
                    },
                    {items: [], storageValues: {}},
                    this);
                this._storageValues = data.storageValues;
                this._container.insertAdjacentHTML('beforeend', this._template({
                    items: data.items.join(''),
                    name: colorScaleName
                }));
                this._colorScaleSize = data.items.length;
            },
            _renderSizeLegend: function (configUnit, chart) {
                var spec = chart.getConfig();
                var sizeScaleCfg = spec.scales[configUnit.size];
                if (!configUnit.size
                    || !sizeScaleCfg.dim
                    || spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim].type !== 'measure') {
                    return;
                }

                var sizeScale = this._unit.size;
                var sizeDimension = this._unit.size.scaleDim;
                configUnit.guide = configUnit.guide || {};
                configUnit.guide.size = this._unit.config.guide.size;
                var sizeScaleName = configUnit.guide.size.label.text || sizeDimension;
                var chartData = _.sortBy(chart.getData(), function (el) {
                    return sizeScale(el[sizeDimension]);
                });
                var chartDataLength = chartData.length;
                var first = chartData[0][sizeDimension];
                var last = chartData[chartDataLength - 1][sizeDimension];
                var values;
                if ((last - first)) {
                    var count = log10(last - first);
                    var xF = Math.round((4 - count));
                    var base = Math.pow(10, xF);
                    var step = (last - first) / 5;
                    var steps = [first, first + step, first + step * 2, first + step * 3, last];
                    values = _(steps)
                        .chain()
                        .map(function (x) {
                            return (x === last || x === first) ? x : Math.round(x * base) / base;
                        })
                        .unique()
                        .value();
                } else {
                    values = [first];
                }

                var items = _.map(values,
                    function (value) {
                        var radius = sizeScale(value);
                        return this._itemSizeTemplate({
                            diameter: doEven(radius * 2 + 2),
                            radius: radius,
                            value: value,
                            className: configUnit.color ? 'color-definite' : 'color-default-size'
                        });
                    }, this).reverse();

                this._container.insertAdjacentHTML('beforeend', this._template({
                    items: items.join(''),
                    name: sizeScaleName
                }));
            },
            onRender: function (chart) {
                if (this._container) {
                    this._container.innerHTML = '';
                    var configUnit = this._findUnit(chart);
                    this._renderColorLegend(configUnit, chart);
                    this._renderSizeLegend(configUnit, chart);

                }
            }
        };
    };
    tauCharts.api.plugins.add('legend', legend);
    return legend;
});