import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
const BAR_GROUP = 'i-role-bar-group';
var interval = function (node) {

    var options = node.options;

    var color = utilsDraw.generateColor(node);

    var partition = node.partition();
    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(partition);

    var xScale,
        yScale,
        tickWidth,
        intervalWidth,
        offsetCategory,

        calculateX,
        calculateY,
        calculateWidth,
        calculateHeight,
        calculateTranslate;
    if (node.flip) {
        xScale = options.yScale;
        yScale = options.xScale;
        tickWidth = options.height / (node.domain(node.y.scaleDim).length);
        intervalWidth = tickWidth / (categories.length + 1);
        offsetCategory = intervalWidth;

        calculateX = (d) => 0;
        calculateY = (d) =>  xScale(d[node.y.scaleDim]) - (tickWidth / 2);
        calculateWidth = (d) => yScale(d[node.x.scaleDim]);
        calculateHeight = (d)=>intervalWidth;
        calculateTranslate = (d, index) => utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2);

    } else {
        xScale = options.xScale;
        yScale = options.yScale;
        tickWidth = options.width / (node.domain(node.x.scaleDim).length);
        intervalWidth = tickWidth / (categories.length + 1);
        offsetCategory = intervalWidth;

        calculateX = (d) =>  xScale(d[node.x.scaleDim]) - (tickWidth / 2);
        calculateY = (d) => yScale(d[node.y.scaleDim]);
        calculateWidth = (d)=>intervalWidth;
        calculateHeight = (d) => options.height - yScale(d[node.y.scaleDim]);
        calculateTranslate = (d, index) => utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);
    }

    var updateBar = function () {
        return this
            .attr('class', (d)=> {
                return 'i-role-datum bar ' + CSS_PREFIX + 'bar ' + color.get(d[color.dimension]);
            })
            .attr('x', calculateX)
            .attr('y', calculateY)
            .attr('width', calculateWidth)
            .attr('height', calculateHeight);
    };
    var updateBarContainer = function () {

        this
            .attr('class', BAR_GROUP)
            .attr('transform', calculateTranslate);
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