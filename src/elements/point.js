import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {sizeScale} from './size';
var point = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;

    var color = utilsDraw.generateColor(node);

    var maxAxis = _.max([options.width, options.height]);
    var size = sizeScale(node.domain(node.size.scaleDim), maxAxis / 100);

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
