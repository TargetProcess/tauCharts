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
    var dfs = function (node) {
        if (node.color) {
            return node;
        }
        var i, children = node.unit || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = dfs(child);
            if (found) {
                return found;
            }
        }
    };
    var _ = tauCharts.api._;
    var legend = function () {
        return {
            init: function (chart) {
                if (this.isNeedLegend(chart)) {
                    this._currentFilters = {};
                    this._container = chart.insertToRightSidebar(this.containerTemplate);
                    this._container.addEventListener('click', function (e) {
                        var target = e.target;
                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('graphical-report__legend__item')) {
                                this._toggleLegendItem(target, chart);
                            }
                            target = target.parentNode;
                        }

                    }.bind(this));
                }
            },
            _toggleLegendItem: function (target, chart) {
                var value = target.getAttribute('data-value');
                var currentFilterID = this._currentFilters[value];
                if (currentFilterID) {
                    this._currentFilters[value] = null;
                    target.classList.remove('disabled');
                    chart.removeFilter(currentFilterID);
                } else {
                    this._currentFilters[value] = 1;
                    var parsedValue = JSON.parse(value);
                    var filter = {
                        tag: 'legend',
                        predicate: function (item) {
                            return item[parsedValue.dimension] != parsedValue.value;
                        }
                    };
                    target.classList.add('disabled');
                    this._currentFilters[value] = chart.addFilter(filter);
                }


            },
            isNeedLegend: function (chart) {
                var conf = chart.getConfig();
                return Boolean(dfs(conf.spec.unit));
            },
            onUnitReady: function (chart, unit) {
                if (unit.type.indexOf('ELEMENT') !== -1) {
                    this._unit = unit;
                }
            },
            _getColorMap: function (chart, color, colorDimension) {
                var data = chart.getData({excludeFilter: ['legend']});
                var keys = _.map(data, function (item) {
                    return item[colorDimension];
                });
                return _.unique(keys).reduce(function (colorMap, item) {
                    colorMap[item] = color.get(item);
                    return colorMap;
                }, {});
            },
            containerTemplate: '<div class="graphical-report__legend"></div>',
            template: _.template('<div class="graphical-report__legend__title"><%=name%></div><%=items%>'),
            itemTemplate: _.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item <%=classDisabled%>">',
                '<div class="graphical-report__legend__guide <%=color%>" ></div><%=label%>',
                '</div>'
            ].join('')),
            onRender: function (chart) {
                if (this._container) {
                    var color = this._unit.options.color;
                    var colorDimension = color.dimension;
                    var colorBrewer = this._getColorMap(chart, color, colorDimension);
                    var conf = chart.getConfig();
                    var configUnit = dfs(conf.spec.unit);
                    configUnit.guide = configUnit.guide || {};
                    configUnit.guide.color =  this._unit.guide.color;
                    configUnit.guide.color.brewer = colorBrewer;
                    var items = _.map(colorBrewer, function (item, key) {
                        var value = JSON.stringify({dimension: colorDimension, value: key});
                        return this.itemTemplate({
                            color: item,
                            classDisabled: this._currentFilters[value] ? 'disabled' : '',
                            label: _.escape(key),
                            value: value
                        });
                    }, this).join('');
                    this._container.innerHTML = this.template({
                        items: items,
                        name: this._unit.guide.color.label.text || this._unit.options.color.dimension
                    });
                }
            }
        };
    };
    tauCharts.api.plugins.add('legend', legend);
    return legend;
});