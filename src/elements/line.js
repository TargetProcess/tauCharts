import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
var line = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;

    var color = utilsDraw.generateColor(node);

    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(node.partition());

    var updateLines = function () {
        this.attr('class', (d) => {
            return CSS_PREFIX + 'line' + ' line ' + color.get(d.key);
        });
        var paths = this.selectAll('path').data((d) => [d.values]);
        paths.call(updatePaths);
        paths.enter().append('path').call(updatePaths);
        paths.exit().remove();
    };

    var line = d3
        .svg
        .line()
        .x((d) => xScale(d[node.x.scaleDim]))
        .y((d) => yScale(d[node.y.scaleDim]));

    var updatePaths = function () {
        this.attr('d', line);
    };

    var lines = options.container.selectAll('.line').data(categories);
    lines.call(updateLines);
    lines.enter().append('g').call(updateLines);
    lines.exit().remove();
};
export {line};