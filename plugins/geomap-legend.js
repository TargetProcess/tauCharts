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

    var utils = tauCharts.api.utils;

    function ChartGeoMapLegend(xSettings) {

        var settings = utils.defaults(
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

                this._chart = chart;
                this._currentFilters = {};
                this._legendColorByScaleId = {};

                var spec = this._chart.getSpec();

                var reducer = function (scaleType) {
                    return function (memo, k) {
                        var s = spec.scales[k];
                        if (s.type === scaleType && s.dim) {
                            memo.push(k);
                        }
                        return memo;
                    };
                };

                this._color = Object.keys(spec.scales).reduce(reducer('color'), []);
                this._fill = Object.keys(spec.scales).reduce(reducer('fill'), []);

                var hasColorScales = (this._color.length > 0);
                var hasFillScales = (this._fill.length > 0);

                if (hasColorScales || hasFillScales) {

                    this._container = this._chart.insertToRightSidebar(this._containerTemplate);

                    if (hasColorScales) {
                        _delegateEvent(
                            this._container,
                            'click',
                            'graphical-report__legend__item-color',
                            function (e, currentTarget) {
                                this._toggleLegendItem(currentTarget);
                            }.bind(this));

                        _delegateEvent(
                            this._container,
                            'mouseover',
                            'graphical-report__legend__item-color',
                            function (e, currentTarget) {
                                this._highlightToggle(currentTarget, true);
                            }.bind(this)
                        );

                        _delegateEvent(
                            this._container,
                            'mouseout',
                            'graphical-report__legend__item-color',
                            function (e, currentTarget) {
                                this._highlightToggle(currentTarget, false);
                            }.bind(this)
                        );
                    }
                }
            },

            onSpecReady: function () {
                this._assignStaticBrewersOrEx();
            },

            onRender: function () {
                this._clearPanel();
                this._drawColorLegend();
                this._drawFillLegend();
            },

            // jscs:disable maximumLineLength
            _containerTemplate: '<div class="graphical-report__legend"></div>',
            _template: utils.template('<div class="graphical-report__legend"><div class="graphical-report__legend__title"><%=name%></div><%=items%></div>'),
            _itemTemplate: utils.template([
                '<div data-scale-id=\'<%= scaleId %>\' data-dim=\'<%= dim %>\' data-value=\'<%= value %>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
                '<div class="graphical-report__legend__guide__wrap">',
                '<div class="graphical-report__legend__guide <%=color%>"></div>',
                '</div>',
                '<%=label%>',
                '</div>'
            ].join('')),
            _itemFillTemplate: utils.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item graphical-report__legend__item-color" style="padding: 6px 0px 10px 40px;margin-left:10px;">',
                '<div class="graphical-report__legend__guide__wrap" style="top:0;left:0;">',
                '   <span class="graphical-report__legend__guide" style="background-color:<%=color%>;border-radius:0"></span>',
                '   <span style="padding-left: 20px"><%=label%></span>',
                '</div>',
                '</div>'
            ].join('')),
            // jscs:enable maximumLineLength

            _clearPanel: function () {
                if (this._container) {
                    this._container.innerHTML = '';
                }
            },

            _drawColorLegend: function () {
                var self = this;

                self._color.forEach(function (c) {
                    var firstNode = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.color === c);
                        })
                        [0];

                    if (firstNode) {
                        var colorScale = firstNode.getScale('color');
                        var dataSource = self._chart.getDataSources({excludeFilter: ['legend']});

                        var domain = utils.unique(dataSource[colorScale.source].data
                            .map(function (x) {
                                return x[colorScale.dim];
                            }));

                        var legendColorItems = domain.map(function (d) {
                            var val = utils.escape(d);
                            var key = colorScale.dim + val;
                            return {
                                scaleId: c,
                                dim: colorScale.dim,
                                color: colorScale(d),
                                disabled: self._currentFilters.hasOwnProperty(key),
                                label: d,
                                value: val
                            };
                        });

                        self._legendColorByScaleId[c] = legendColorItems;
                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                items: legendColorItems
                                    .map(function (d) {
                                        return self._itemTemplate({
                                            scaleId: d.scaleId,
                                            dim: d.dim,
                                            color: d.color,
                                            classDisabled: d.disabled ? 'disabled' : '',
                                            label: d.label,
                                            value: d.value
                                        });
                                    })
                                    .join(''),
                                name: ((((firstNode.guide || {}).color || {}).label || {}).text) || colorScale.dim
                            }));
                    }
                });
            },

            _drawFillLegend: function () {
                var self = this;

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

                        var items = utils.range(brewer.length).map(function (i) {
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
                                value: utils.escape(d)
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

            _toggleLegendItem: function (target) {

                var scaleId = target.getAttribute('data-scale-id');
                var dim = target.getAttribute('data-dim');
                var val = target.getAttribute('data-value');
                var key = dim + val;

                var items = this._legendColorByScaleId[scaleId];
                var activeItems = items.filter(function (x) {
                    return !x.disabled;
                });

                if (activeItems.length === 1 && scaleId === activeItems[0].scaleId && val === activeItems[0].value) {
                    return;
                }

                var state = this._currentFilters;
                if (state.hasOwnProperty(key)) {
                    var filterId = state[key];
                    delete state[key];
                    target.classList.remove('disabled');
                    this._chart.removeFilter(filterId);
                } else {
                    target.classList.add('disabled');
                    state[key] = this._chart.addFilter({
                        tag: 'legend',
                        predicate: function (row) {
                            return row[dim] != val;
                        }
                    });
                }
                this._chart.refresh();
            },

            _highlightToggle: function (target, doHighlight) {
                var scaleId = target.getAttribute('data-scale-id');
                var dim = target.getAttribute('data-dim');
                var val = target.getAttribute('data-value');

                this._chart
                    .select(function (unit) {
                        return unit.config.color === scaleId;
                    })
                    .forEach(function (unit) {
                        unit.fire('highlight', function (row) {
                            return doHighlight ? (row[dim] == val) : true;
                        });
                    });
            },

            _generateColorMap: function (domain) {

                var limit = 20;

                var defBrewer = utils.range(limit).map(function (i) {
                    return 'color20-' + (1 + i);
                });

                return domain.reduce(function (memo, val, i) {
                        memo[val] = defBrewer[i % limit];
                        return memo;
                    },
                    {});
            },

            _assignStaticBrewersOrEx: function () {
                var self = this;
                self._color.forEach(function (c) {
                    var scaleConfig = self
                        ._chart
                        .getSpec()
                        .scales[c];

                    var fullLegendDataSource = self
                        ._chart
                        .getDataSources({excludeFilter: ['legend']});

                    var fullLegendDomain = self
                        ._chart
                        .getScaleFactory(fullLegendDataSource)
                        .createScaleInfoByName(c)
                        .domain();

                    if (!scaleConfig.brewer) {
                        scaleConfig.brewer = ((scaleConfig.dimType !== 'measure') ?
                            (self._generateColorMap(fullLegendDomain)) :
                            (['#e5f5e0', '#a1d99b', '#31a354']));
                    }
                });
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('geomap-legend', ChartGeoMapLegend);

    return ChartGeoMapLegend;
});