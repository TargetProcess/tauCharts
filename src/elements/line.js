import {utilsDraw} from '../utils/utils-draw';
var line = function (node) {

    var options = node.options;
    var xScale = node.scaleTo(node.x.scaleDim, [0, options.width]);
    var yScale = node.scaleTo(node.y.scaleDim, [options.height, 0]);
    var color = utilsDraw.generateColor(node);

    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(node.partition());

    var updateLines = function () {
        this.attr('class', (d) => 'line ' + color.get(d.key));
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