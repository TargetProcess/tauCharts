import {utilsDraw} from '../utils/utils-draw';
var line = function (node) {

    var options = node.options || {};
    options.xScale = node.scaleTo(node.x.scaleDim, [0, options.width]);
    options.yScale = node.scaleTo(node.y.scaleDim, [options.height, 0]);
    var color = utilsDraw.generateColor(node);
    var categories = d3.nest()
        .key(function(d){
            return d[color.dimension];
        })
        .entries(node.partition());


    var updateLines = function () {
        this.attr('class', function(d){
            return 'line ' + color.get(d.key);
        });
        var paths = this.selectAll('path').data(function (d) {
            return [d.values];
        });
        paths.call(updatePaths);
        paths.enter().append('path').call(updatePaths);
        paths.exit().remove();
    };

    var line = d3.svg.line()
        .x((d) => options.xScale(d[node.x.scaleDim]))
        .y((d) => options.yScale(d[node.y.scaleDim]));

    var updatePaths = function () {
        this.attr('d', line);
    };



    var lines = options.container.selectAll('.line').data(categories);
    lines.call(updateLines);
    lines.enter().append('g').call(updateLines);
    lines.exit().remove();

};
export {line};