import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {sizeScale} from './size';
var point = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;
    var color = options.color;

    var maxAxisSize = _.max([node.guide.x.tickFontHeight, node.guide.y.tickFontHeight].filter((x) => x !== 0)) / 2;
    var size = sizeScale(node.domain(node.size.scaleDim), 1, maxAxisSize);

    var update = function () {
        return this
            .attr('r',      (d) => size(d[node.size.scaleDim]))
            .attr('cx',     (d) => xScale(d[node.x.scaleDim]))
            .attr('cy',     (d) => yScale(d[node.y.scaleDim]))
            .attr('class',  (d) => CSS_PREFIX + 'dot' + ' dot i-role-datum ' + color.get(d[color.dimension]));
    };

    var elements = options.container.selectAll('.dot').data(node.partition());
    elements.call(update);
    elements.exit().remove();
    elements.enter().append('circle').call(update);
};

export {point};
