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

        var plugin = {

            init: function (chart) {
                var config = chart.getConfig();
                this._chart = chart;
                this._color = Object
                    .keys(config.scales)
                    .reduce(function(memo, k) {
                        var s = config.scales[k];
                        if (s.type === 'color' && s.dim) {
                            memo.push(k);
                        }
                        return memo;
                    }, []);

                this._fill = Object
                    .keys(config.scales)
                    .reduce(function(memo, k) {
                        var s = config.scales[k];
                        if (s.type === 'fill' && s.dim) {
                            memo.push(k);
                        }
                        return memo;
                    }, []);

                if (this._color.length > 0 || this._fill.length > 0) {
                    this._container = chart.insertToRightSidebar(this._containerTemplate);
                }
            },

            onRender: function () {

                var self = this;

                self._color.forEach(function (c) {
                    var nodes = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.type === 'COORDS.MAP') && (unit.config.color === c);
                        });

                    if (nodes.length > 0) {
                        var colorScale = nodes[0].colorScale;
                        var domain = colorScale.domain();
                        var items = domain.map(function (d) {
                            return self._itemTemplate({
                                color: colorScale(d),
                                classDisabled: 'disabled',
                                label: d || 'label',
                                value: _.escape(d)
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
                        var fillScale = nodes[0].fillScale;
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

            _containerTemplate: '<div class="graphical-report__legend"></div>',
            _template: _.template('<div class="graphical-report__legend"><div class="graphical-report__legend__title"><%=name%></div><%=items%></div>'),
            _itemTemplate: _.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
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
            ].join(''))
        };

        return plugin;
    }

    tauCharts.api.plugins.add('geomap-legend', ChartGeoMapLegend);

    return ChartGeoMapLegend;
});