import {CSS_PREFIX} from '../const';
import {flipHub} from './element.interval.fn';

const BAR_GROUP = 'i-role-bar-group';

var interval = function (node) {

    var options = node.options;

    var xScale = options.xScale,
        yScale = options.yScale,
        colorScale = options.color;

    var method = flipHub[node.flip ? 'FLIP' : 'NORM'];

    var allCategories = node.groupBy(node.source(), node.color.scaleDim);
    var categories = node.groupBy(node.partition(), node.color.scaleDim);

    var colorIndexScale = (d) => {
        var index = 0;
        var targetKey = JSON.stringify(d.key);
        _.find(allCategories, (catItem, catIndex) => {
            var isFound = (JSON.stringify(catItem.key) === targetKey);
            if (isFound) {
                index = catIndex;
            }
            return isFound;
        });

        return index;
    };
    colorScale.scaleDim = node.color.scaleDim;
    colorIndexScale.count = () => allCategories.length;

    var params = method({
        node,
        xScale,
        yScale,
        colorScale,
        colorIndexScale,
        width: options.width,
        height: options.height,
        defaultSizeParams: {
            tickWidth: 5,
            intervalWidth: 5,
            offsetCategory: 0
        }
    });
    drawInterval(params, options.container, categories);
};
function drawInterval({
    calculateX,
    calculateY,
    colorScale,
    calculateWidth,
    calculateHeight,
    calculateTranslate
    },
    container,
    data) {
    var updateBar = function () {
        return this
            .attr('height', calculateHeight)
            .attr('width', calculateWidth)
            .attr('class', (d) => {
                return `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[colorScale.scaleDim])}`;
            })
            .attr('x', calculateX)
            .attr('y', calculateY);
    };

    var updateBarContainer = function () {
        this.attr('class', BAR_GROUP)
            .attr('transform', calculateTranslate);
        var bars = this.selectAll('bar').data((d) => d.values);
        bars.call(updateBar);
        bars.enter().append('rect').call(updateBar);
        bars.exit().remove();
    };

    var elements = container.selectAll(`.${BAR_GROUP}`).data(data);
    elements.call(updateBarContainer);
    elements.enter().append('g').call(updateBarContainer);
    elements.exit().remove();
}

export {interval, drawInterval};