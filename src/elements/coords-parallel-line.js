import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';

var CoordsParallelLine = {

    draw: function (node) {

        node.color = node.dimension(node.color, node);

        var options = node.options;

        var scalesMap = node.x.reduce(
            (memo, xN) => {
                memo[xN] = node.scaleTo(xN, [options.height, 0], {});
                return memo;
            },
            {});

        var color = utilsDraw.generateColor(node);

        var categories = d3
            .nest()
            .key((d) => d[color.dimension])
            .entries(node.partition())
            .map((src) => {
                var row = src.values[0];
                var memo = [];
                node.x.forEach((propName) => {
                    memo.push({key: propName, val: row[propName]});
                });
                return memo;
            });

        var updateLines = function () {
            this.attr('class', (d) => 'graphical-report__' + 'line' + ' line ' + 'color10-9');
            var paths = this.selectAll('path').data((d) => [d]);
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var segment = options.width / (node.x.length - 1);
        var segmentMap = {};
        node.x.forEach((propName, i) => {
            segmentMap[propName] = (i * segment);
        });

        var fnLine = d3.svg.line()
            .x((d) => segmentMap[d.key])
            .y((d) => scalesMap[d.key](d.val));

        var updatePaths = function () {
            this.attr('d', fnLine);
        };

        var lines = options.container.selectAll('.line').data(categories);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    }
};

export {CoordsParallelLine};