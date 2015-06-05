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

    function ChartParallelBrushing(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                verbose: false
            });

        var plugin = {

            init: function (chart) {
                if (settings.verbose) {
                    plugin.panel = chart.insertToRightSidebar(this.template());
                }
            },

            onRender: function (chart) {

                chart
                    .select(function (node) {
                        return node.config.type === 'PARALLEL/ELEMENT.LINE';
                    })
                    .forEach(function (node, i) {
                        node.parentUnit.on('brush', function (sender, e) {

                            var predicates = e.map(function (item) {
                                var p = item.dim;
                                var f = item.func;
                                var a = item.args;
                                var r = function () {
                                    return true;
                                };

                                if (f === 'between') {
                                    r = function (row) {
                                        return (row[p] >= a[0]) && (a[1] >= row[p]);
                                    };
                                }

                                if (f === 'inset') {
                                    r = function (row) {
                                        return a.indexOf(row[p]) >= 0;
                                    };
                                }

                                return r;
                            });

                            var matches = 0;
                            node.highlight(function (row) {

                                var r = predicates.every(function (func) {
                                    return func(row);
                                });

                                matches += (r ? 1 : 0);

                                return r;
                            });

                            if (settings.verbose) {
                                var part = plugin.panel.getElementsByClassName('i-' + i);
                                if (part.length === 0) {
                                    var div = document.createElement('div');
                                    div.className = ('i-' + i);
                                    plugin.panel.appendChild(div);
                                    part[0] = div;
                                }
                                part[0].innerHTML = e.reduce(
                                    function (s, item) {
                                        return (s += '<div>' + item.dim + ': [' + item.args.join(',') + ']' + '</div>');
                                    },
                                    '<div>' + 'Matched: ' + matches + '</div>'
                                );
                            }
                        });
                    });
            },

            template: _.template(['<div class="graphical-report__chart_brushing_panel"></div>'].join(''))
        };

        return plugin;
    }

    tauCharts.api.plugins.add('parallel-brushing', ChartParallelBrushing);

    return ChartParallelBrushing;
});