import {utilsDraw} from '../utils/utils-draw';
import {point} from './point';
import {CSS_PREFIX} from '../const';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
var line = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;
    node.size = {};
    var color = utilsDraw.generateColor(node);
    options.color =  color;
    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(node.partition());
    var widthClass = getLineClassesByWidth(options.width);
    var countClass = getLineClassesByCount(categories.length);
    var updateLines = function (d) {
        this.attr('class', (d) => {
            return [CSS_PREFIX + 'line i-role-datum ', 'line', color.get(d.key), widthClass, countClass].join(' ');
        });
        var paths = this.selectAll('path').data((d) => [d.values]);
        paths.call(updatePaths);
        paths.enter().append('path').call(updatePaths);
        paths.exit().remove();
    };
    var drawPointsIfNeed = function (categories) {
        var data = categories.reduce(function (data, item) {
            var values = item.values;
            if (values.length === 1) {
                data.push(values[0]);
            }
            return data;
        }, []);
        var update = function () {
            return this
                .attr('r', 1.5)
                .attr('class', (d) => {
                    return CSS_PREFIX + 'dot-line dot-line i-role-datum ' + CSS_PREFIX + 'dot ' + 'i-role-datum ' + color.get(d[color.dimension]);
                })
                .attr('cx', (d) => xScale(d[node.x.scaleDim]))
                .attr('cy', (d) => yScale(d[node.y.scaleDim]));
        };

        var elements = options.container.selectAll('.dot-line').data(data);
        elements.call(update);
        elements.exit().remove();
        elements.enter().append('circle').call(update);
    };

    var line;
    /*if(node.isGuide) {
        var  i = 0;
        line = d3
            .svg
            .line()
            .x((d) => {
                if(i) {
                    return xScale.rangeExtent()[1];
                } else {
                    i++;
                    return 0;
                }
            })
            .y((d) => yScale(45));
    } else {*/
        line = d3
            .svg
            .line()
            .x((d) => xScale(d[node.x.scaleDim]))
            .y((d) => yScale(d[node.y.scaleDim]));
    /*}*/


    var updatePaths = function () {
        this.attr('d', line);
    };
    drawPointsIfNeed(categories);
    var lines = options.container.selectAll('.line').data(categories);
    lines.call(updateLines);
    lines.enter().append('g').call(updateLines);
    lines.exit().remove();
};
export {line};