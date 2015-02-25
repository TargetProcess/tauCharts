import {CSS_PREFIX} from '../const';

var point = function (node) {

    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;
    var colorScale = options.color;
    var sizeScale = options.sizeScale;

    var update = function () {
        return this
            .attr('r', (d) => sizeScale(d[node.size.scaleDim]))
            .attr('cx', (d) => xScale(d[node.x.scaleDim]))
            .attr('cy', (d) => yScale(d[node.y.scaleDim]))
// jscs:disable
            .attr('class', (d) => `${CSS_PREFIX}dot dot i-role-element i-role-datum ${colorScale(d[node.color.scaleDim])}`);
// jscs:enable
    };

    var elements = options.container.selectAll('.dot').data(node.partition());
    elements.call(update);
    elements.exit().remove();
    elements.enter().append('circle').call(update);
};

export {point};
