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

    var _ = tauCharts.api._;

    function ChartGeoMapLegend(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var _delegateEvent = function (element, eventName, selector, callback) {
            element.addEventListener(eventName, function (e) {
                var target = e.target;
                while (target !== e.currentTarget && target !== null) {
                    if (target.classList.contains(selector)) {
                        callback(e, target);
                    }
                    target = target.parentNode;
                }
            });
        };

        var plugin = {

            init: function (chart) {

                var config = chart.getConfig();

                var reducer = function (scaleType) {
                    return function (memo, k) {
                        var s = config.scales[k];
                        if (s.type === scaleType && s.dim) {
                            memo.push(k);
                        }
                        return memo;
                    };
                };

                this._chart = chart;
                this._color = Object.keys(config.scales).reduce(reducer('color'), []);
                this._fill = Object.keys(config.scales).reduce(reducer('fill'), []);

                this._currentFilters = {};
                this._storageValues = {};

                if (this._color.length > 0 || this._fill.length > 0) {
                    this._container = chart.insertToRightSidebar(this._containerTemplate);
                    _delegateEvent(
                        this._container,
                        'click',
                        'graphical-report__legend__item-color',
                        function (e, currentTarget) {
                            this._toggleLegendItem(currentTarget, chart);
                        }.bind(this));
                }
            },

            onRender: function () {

                var self = this;

                if (self._container) {
                    self._container.innerHTML = '';
                }

                self._color.forEach(function (c) {
                    var nodes = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.type === 'COORDS.MAP') && (unit.config.color === c);
                        });

                    if (nodes.length > 0) {
                        var colorScale = nodes[0].getScale('color');
                        var fullData = chart.getData({
                            excludeFilter: ['legend'],
                            isNew: true
                        })[colorScale.source].data;

                        var domain = _(fullData)
                            .chain()
                            .map(function (r) {
                                return r[colorScale.dim];
                            })
                            .uniq()
                            .value();

                        var items = domain.map(function (d) {
                            var val = _.escape(d);
                            var key = colorScale.dim + val;
                            return self._itemTemplate({
                                dim: colorScale.dim,
                                color: colorScale(d),
                                classDisabled: self._currentFilters[key] ? 'disabled' : '',
                                label: d || 'label',
                                value: val
                            });
                        });

                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                items: items.join(''),
                                name: ((((nodes[0].guide || {}).color || {}).label || {}).text) || colorScale.dim
                            }));
                    }
                });

                self._fill.forEach(function (c) {
                    var nodes = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.type === 'COORDS.MAP') && (unit.config.fill === c);
                        });

                    if (nodes.length > 0) {
                        var fillScale = nodes[0].getScale('fill');
                        var brewer = fillScale.brewer;
                        var domain = fillScale.domain();

                        var step = (domain[1] - domain[0]) / brewer.length;

                        var items = _.times(brewer.length, _.identity).map(function (i) {
                            var d = domain[0] + i * step;
                            var label = '';

                            if (i === 0) {
                                label = domain[0];
                            }

                            if (i === (brewer.length - 1)) {
                                label = domain[1];
                            }

                            return self._itemFillTemplate({
                                color: fillScale(d),
                                label: label,
                                value: _.escape(d)
                            });
                        });

                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                items: items.join(''),
                                name: ((((nodes[0].guide || {}).fill || {}).label || {}).text) || fillScale.dim
                            }));
                    }
                });
            },

            // jscs:disable maximumLineLength
            _containerTemplate: '<div class="graphical-report__legend"></div>',
            _template: _.template('<div class="graphical-report__legend"><div class="graphical-report__legend__title"><%=name%></div><%=items%></div>'),
            _itemTemplate: _.template([
                '<div data-dim=\'<%= dim %>\' data-value=\'<%= value %>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
                '<div class="graphical-report__legend__guide__wrap"><div class="graphical-report__legend__guide <%=color%>" ></div></div><%=label%>',
                '</div>'
            ].join('')),
            _itemFillTemplate: _.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item graphical-report__legend__item-color" style="padding: 6px 20px 10px 40px;">',
                '<div class="graphical-report__legend__guide__wrap" style="top:0">',
                '   <span class="graphical-report__legend__guide" style="background-color:<%=color%>;border-radius:0"></span>',
                '   <span style="padding-left: 20px"><%=label%></span>',
                '</div>',
                '</div>'
            ].join('')),
            // jscs:enable maximumLineLength

            _toggleLegendItem: function (target, chart) {

                var dim = target.getAttribute('data-dim');
                var val = target.getAttribute('data-value');
                var key = dim + val;

                if (this._currentFilters.hasOwnProperty(key)) {
                    var currentFilterID = this._currentFilters[key];
                    delete this._currentFilters[key];
                    target.classList.remove('disabled');

                    chart.removeFilter(currentFilterID);
                } else {
                    this._currentFilters[key] = 1;
                    var filter = {
                        tag: 'legend',
                        predicate: function (row) {
                            return row[dim] !== val;
                        }
                    };
                    target.classList.add('disabled');
                    this._currentFilters[key] = chart.addFilter(filter);
                }
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('geomap-legend', ChartGeoMapLegend);

    return ChartGeoMapLegend;
});