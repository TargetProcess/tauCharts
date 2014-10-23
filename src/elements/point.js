import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
var point = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;

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
            .attr('r', (d) => {
                var s = size(d[node.size.scaleDim]);
                return (!_.isFinite(s)) ? maxAxis / 100 : s;
            })
            .attr('class', (d) => {
                return CSS_PREFIX + 'dot' + ' dot i-role-datum ' + color.get(d[color.dimension]);
            })
            .attr('cx', (d) => xScale(d[node.x.scaleDim]))
            .attr('cy', (d) => yScale(d[node.y.scaleDim]));
    };

    var elements = options.container.selectAll('.dot').data(node.partition());
    elements.call(update);
    elements.exit().remove();
    elements.enter().append('circle').call(update);
};

export {point};