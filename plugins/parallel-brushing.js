import tauCharts from 'taucharts';

{

    var utils = tauCharts.api.utils;

    function ChartParallelBrushing(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                verbose: false,
                forceBrush: {}
            });

        var plugin = {

            init: function (chart) {
                if (settings.verbose) {
                    this.panel = chart.insertToRightSidebar(this.template());
                }

                chart.traverseSpec(
                    chart.getSpec(),
                    function (unit) {
                        if (unit && unit.type === 'COORDS.PARALLEL') {
                            unit.guide = unit.guide || {};
                            unit.guide.enableBrushing = true;
                        }
                    });

                plugin.forceBrush = settings.forceBrush || {};
            },

            onRender: function (chart) {

                var scales = chart.getSpec().scales;

                var toBrush = Object
                    .keys(scales)
                    .reduce(function (memo, k) {
                        var dim = scales[k].dim;
                        if (plugin.forceBrush[dim]) {
                            memo[k] = plugin.forceBrush[dim];
                        }
                        return memo;
                    },
                    {});

                var parallelLines = chart.select(function (node) {
                    return node.config.type === 'PARALLEL/ELEMENT.LINE';
                });

                parallelLines.forEach(function (node, i) {
                    node.parentUnit.on('brush', function (sender, e) {

                        plugin.forceBrush = {};

                        var predicates = e.map(function (item) {
                            var p = item.dim;
                            var f = item.func;
                            var a = item.args;

                            plugin.forceBrush[p] = a;

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
                        node.fire('highlight', function (row) {

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

                parallelLines.forEach(function (node) {
                    node.parentUnit.fire('force-brush', toBrush);
                });
            },

            template: utils.template('<div class="graphical-report__chart_brushing_panel"></div>')
        };

        return plugin;
    }

    tauCharts.api.plugins.add('parallel-brushing', ChartParallelBrushing);
}
