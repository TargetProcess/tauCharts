import {utils} from '../utils/utils';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
const BAR_GROUP = 'i-role-bar-group';
var interval = function (node) {

    var options = node.options;

    var tickWidth = options.width / (node.domain(node.x.scaleDim).length);

    var color = utilsDraw.generateColor(node);
    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(node.partition());
    var barWidth = tickWidth / (categories.length + 1);

    var xScale = options.xScale;
    var yScale = options.yScale;
    var offsetCategory = barWidth;
    var updateBar = function (d) {
        return this
            .attr('class', (d)=>{
                return 'i-role-datum bar ' + CSS_PREFIX + 'bar ' + color.get(d[color.dimension]);
            })
            .attr('x', (d) => {
                return xScale(d[node.x.scaleDim]) - (tickWidth/2);
            })
            .attr('y', (d) => yScale(d[node.y.scaleDim]))
            .attr('width', barWidth)
            .attr('height', (d) => options.height - yScale(d[node.y.scaleDim]));
    };
    var updateBarContainer = function () {
        this
            .attr('class', BAR_GROUP)
            .attr('transform', (d, index) => {
                return utilsDraw.translate(index  * offsetCategory + offsetCategory/2, 0);
            });
        var bars = this.selectAll('bar').data((d) => d.values);
        bars.call(updateBar);
        bars.enter().append('rect').call(updateBar);
        bars.exit().remove();
    };

    var elements = options.container.selectAll('.' + BAR_GROUP).data(categories);
    elements.call(updateBarContainer);
    elements.enter().append('g').call(updateBarContainer);
    elements.exit().remove();
};

export {interval};