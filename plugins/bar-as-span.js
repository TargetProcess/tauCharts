import tauCharts from 'taucharts';
import * as d3 from 'd3';

var utils = tauCharts.api.utils;

function BarAsSpan(settings) {

    var xDim0 = settings.x0;
    var yDim0 = settings.y0;
    var collapse = (settings.collapse != null ? settings.collapse : true);

    var transformX0 = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[xDim0]);
            }
        };
    };
    var transformY0 = function (model) {
        return {
            y0: function y0(dataRow) {
                return model.scaleY.value(dataRow[yDim0]);
            }
        };
    };

    var adjustValueScale = function (model) {

        var data = model.data();
        if (data.length === 0) {
            return {};
        }

        var yScale = model.scaleY;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        var dim0 = (model.flip ? xDim0 : yDim0);
        var dim = yScale.dim;
        data.forEach(function (d) {
            var y0 = d[dim0];
            var y = d[dim];
            var min = (y0 < y ? y0 : y);
            var max = (y > y0 ? y : y0);
            minY = (min < minY ? min : minY);
            maxY = (max > maxY ? max : maxY);
        });

        yScale.fixup(function (yScaleConfig) {

            var newConf = {};

            if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < maxY) {
                newConf.max = maxY;
            }

            if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > minY) {
                newConf.min = minY;
            }

            return newConf;
        });

        return {};
    };

    // Todo: Categories names can repeat among facets.
    var totalLines = {};
    var totalLinesPerFacet = {};

    var transformMultiline = function (model) {

        var data = model.data().slice();
        var xScale = model.scaleX;
        var yScale = model.scaleY;

        if (data.length === 0 || !xScale.discrete) {
            return {};
        }

        var dim0 = (model.flip ? xDim0 : yDim0);
        var dim = yScale.dim;
        data.sort(utils.createMultiSorter(
            function (a, b) { return (a[dim0] - b[dim0]); },
            function (a, b) { return (a[dim] - b[dim]); }
        ));

        var catDim = xScale.dim;
        var categories = xScale.domain();
        var categoryLines = categories.reduce(function (map, c) {
            map[c] = [];
            return map;
        }, {});
        var itemLine = new Map();

        var collapseIteratee = function (d) {
            var cat = d[catDim];
            var lines = categoryLines[cat];
            var lineNum = lines.findIndex(function (l) {
                return (l[l.length - 1][dim] <= d[dim0]);
            });
            if (lineNum < 0) {
                lineNum = lines.length;
                lines.push([]);
            }
            lines[lineNum].push(d);
            itemLine.set(d, lineNum);
        };
        var expandIteratee = function (d) {
            var cat = d[catDim];
            var lines = categoryLines[cat];
            var lineNum = lineNum = lines.length;
            lines.push([]);
            lines[lineNum].push(d);
            itemLine.set(d, lineNum);
        };

        data.forEach(collapse ? collapseIteratee : expandIteratee);

        Object.keys(categoryLines).forEach(function (key) {
            totalLines[key] = categoryLines[key];
        });

        xScale.fixup(function (xScaleConfig) {

            var newConf = {};

            var totalRows = xScale.domain().reduce(function (sum, cat) {
                return (sum + totalLines[cat].length);
            }, 0);

            xScale.domain().forEach(function (cat) {
                totalLinesPerFacet[cat] = totalRows;
            });

            newConf.ratio = function (cat) {
                return (totalLines[cat].length / totalLinesPerFacet[cat]);
            };

            return newConf;
        });

        return {
            xi: function (row) {
                var cat = row[catDim];
                var catHeight = xScale.stepSize(cat);
                var top = (model.xi(row) - catHeight / 2);
                var lineHeight = (catHeight / totalLines[cat].length);
                var lineIndex = itemLine.get(row);
                return (top + lineHeight * (lineIndex + 0.5));
            }
        };
    };

    return {

        onSpecReady: function (chart, specRef) {

            chart.traverseSpec(
                specRef,
                function (unit, parentUnit) {

                    if (unit.type === 'ELEMENT.INTERVAL') {

                        unit.transformModel = [
                            (unit.flip ? transformX0 : transformY0),
                            transformMultiline
                        ];

                        unit.adjustScales = [
                            adjustValueScale
                        ];

                        unit.guide.enableColorToBarPosition = false;

                        unit.guide.label = (unit.guide.label || {});
                        unit.guide.label.position = (unit.guide.label.position || (unit.flip ? [
                            'inside-start-then-outside-end-horizontal',
                            'hide-by-label-height-horizontal'
                        ] : [
                                'inside-start-then-outside-end-vertical'
                            ]));
                    }
                });
        }
    };
}

tauCharts.api.plugins.add('bar-as-span', BarAsSpan);

export default BarAsSpan;
