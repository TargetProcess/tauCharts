import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
const BAR_GROUP = '.i-role-bar-group';
var interval = function (node) {

    var options = node.options;
    var barWidth = options.width / (node.domain(node.x.scaleDim).length);
    var color = utilsDraw.generateColor(node);
    // debugger
    var xScale = options.xScale;
    var yScale = options.yScale;
    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(node.partition());
    var offsetCategory = barWidth / categories.length;
    var updateBar = function () {
        return this
            .attr('class', 'i-role-datum bar ' + CSS_PREFIX + 'bar')
            .attr('transform', (d, index) => {
                return utils.translate(index * offsetCategory, 0);
            });
        /* return this
         .attr('class', 'i-role-datum bar ' + CSS_PREFIX + 'bar')
         .attr('x', (d) => {
         xScale(d[node.x.scaleDim]) - barWidth / 2
         })
         .attr('y', (d) => yScale(d[node.y.scaleDim]))
         .attr('width', barWidth)
         .attr('height', (d) => options.height - yScale(d[node.y.scaleDim]));*/
    };

    var elements = options.container.selectAll(BAR_GROUP).data(categories);
    elements.call(updateBar);
    elements.enter().append('g').call(updateBar);
    elements.exit().remove();
};

export {interval};