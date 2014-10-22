import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';

var interval = function (node) {

    var options = node.options;
    var barWidth = options.width / (node.domain(node.x.scaleDim).length) - 8;

    var xScale = options.xScale;
    var yScale = options.yScale;

    var update = function () {
        return this
            .attr('class', 'i-role-datum  bar')
            .attr('x', (d) => xScale(d[node.x.scaleDim]) - barWidth / 2)
            .attr('y', (d) => yScale(d[node.y.scaleDim]))
            .attr('width', barWidth)
            .attr('height', (d) => options.height - yScale(d[node.y.scaleDim]));
    };

    var elements = options.container.selectAll(".bar").data(node.partition());
    elements.call(update);
    elements.enter().append('rect').call(update);
    elements.exit().remove();
};

export {interval};