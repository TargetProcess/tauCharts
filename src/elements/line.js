import {CSS_PREFIX} from '../const';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

var line = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;
    var colorScale = options.color;

    var categories = node.groupBy(node.partition(), node.color.scaleDim);

    var widthClass = getLineClassesByWidth(options.width);
    var countClass = getLineClassesByCount(categories.length);
    var updateLines = function () {
        this.attr('class', (d) => `${CSS_PREFIX}line i-role-element i-role-datum line ${colorScale(d.key)} ${widthClass} ${countClass}`);
        var paths = this.selectAll('path').data((d) => [d.values]);
        paths.call(updatePaths);
        paths.enter().append('path').call(updatePaths);
        paths.exit().remove();
    };
    var drawPoints = function (points) {
        var update = function () {
            return this
                .attr('r', 1.5)
                .attr('class', (d) => `${CSS_PREFIX}dot-line dot-line i-role-element ${CSS_PREFIX}dot i-role-datum ${colorScale(d[node.color.scaleDim])}`)
                .attr('cx', (d) => xScale(d[node.x.scaleDim]))
                .attr('cy', (d) => yScale(d[node.y.scaleDim]));
        };

        var elements = options.container.selectAll('.dot-line').data(points);
        elements.call(update);
        elements.exit().remove();
        elements.enter().append('circle').call(update);
    };

    var line = d3
            .svg
            .line()
            .x((d) => xScale(d[node.x.scaleDim]))
            .y((d) => yScale(d[node.y.scaleDim]));

    var updatePaths = function () {
        this.attr('d', line);
    };


    var points = categories.reduce(function (memo, item) {
        var values = item.values;
        if (values.length === 1) {
            memo.push(values[0]);
        }
        return memo;
    }, []);

    if (points.length > 0) {
        drawPoints(points);
    }

    var lines = options.container.selectAll('.line').data(categories);
    lines.call(updateLines);
    lines.enter().append('g').call(updateLines);
    lines.exit().remove();
};
export {line};