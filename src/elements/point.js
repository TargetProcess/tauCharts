import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
var point = function (node) {

    var filteredData = node.partition();
    var options = node.options;
    var xScale = node.scaleTo(node.x.scaleDim, [0, options.width]);
    var yScale = node.scaleTo(node.y.scaleDim, [options.height, 0]);

    var color = utilsDraw.generateColor(node);
    var maxAxis = _.max([options.width, options.height]);
    var sizeValues = node.domain(node.size.scaleDim);

    var size = d3
        .scale
        .linear()
        .range([maxAxis / 200, maxAxis / 100])
        .domain([
            Math.min.apply(null, sizeValues),
            Math.max.apply(null, sizeValues)
        ]);

    var update = function () {
        return this
            .attr('r', function (d) {
                var s = size(d[node.size.scaleDim]);
                if (!_.isFinite(s)) {
                    s = maxAxis / 100;
                }
                return s;
            })
            .attr('class', (d) => 'dot i-role-datum ' + color.get(d[color.dimension]))
            .attr('cx', (d) => xScale(d[node.x.scaleDim]))
            .attr('cy', (d) => yScale(d[node.y.scaleDim]));
    };

    var elements = options.container.selectAll('.dot').data(filteredData);
    elements.call(update);
    elements.exit().remove();
    elements.enter().append('circle').call(update);
};

export {point};