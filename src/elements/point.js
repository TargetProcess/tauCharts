import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
var point = function (node) {

    var filteredData = node.partition();
    var srcData = node.source();
    var options = node.options || {};
    options.xScale = node.scaleTo(node.x, [0, options.width]);
    options.yScale = node.scaleTo(node.y, [options.height, 0]);


    var color = utilsDraw.generateColor(node);
    var maxAxis = _.max([options.width, options.height]);
    var sizeValues = _(srcData).chain().pluck(node.size).map((value)=>parseInt(value, 10));

    var size = d3
        .scale
        .linear()
        .range([maxAxis / 200, maxAxis / 100])
        .domain([
            sizeValues.min().value(),
            sizeValues.max().value()
        ]);

    var update = function () {
        return this
            .attr('r', function (d) {
                var s = size(d[node.size]);
                if (!_.isFinite(s)) {
                    s = maxAxis / 100;
                }
                return s;
            })
            .attr('class', function (d) {
                return 'dot i-role-datum ' + color.get(d[color.dimension]);
            })
            .attr('cx', function (d) {
                return options.xScale(d[node.x]);
            })
            .attr('cy', function (d) {
                return options.yScale(d[node.y]);
            });
    };

    var elements = options.container.selectAll('.dot').data(filteredData);
    elements.call(update);
    elements.exit().remove();
    elements.enter().append('circle').call(update);
};

export {point};