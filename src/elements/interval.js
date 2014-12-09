import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
const BAR_GROUP = 'i-role-bar-group';
var isMeasure = function (dim) {
    return dim.dimType === 'measure';
};

var getSizesParams = function (params) {
    var tickWidth, intervalWidth, offsetCategory;
    if (isMeasure(params.dim)) {
        tickWidth = 5;
        intervalWidth = 5;
        offsetCategory = 0;
    } else {
        tickWidth = params.size / (params.domain().length);
        intervalWidth = tickWidth / (params.categories.length + 1);
        offsetCategory = intervalWidth;
    }

    /* jshint ignore:start */
    return {
        tickWidth,
        intervalWidth,
        offsetCategory
    };
    /* jshint ignore:end */
};

var interval = function (node) {

    var options = node.options;

    var color = utilsDraw.generateColor(node);
    node.options.color = color;
    var partition = node.partition();

    var categories = d3
        .nest()
        .key((d) => d[color.dimension])
        .entries(partition);

    var xScale = options.xScale,
        yScale = options.yScale,
        calculateX,
        calculateY,
        calculateWidth,
        calculateHeight,
        calculateTranslate;

    if (node.flip) {

        var xMin = Math.min.apply(null, xScale.domain());
        let startPoint = (xMin <= 0) ? 0 : xMin;

        /* jshint ignore:start */
        var {tickWidth,intervalWidth, offsetCategory} = getSizesParams({
            domain: yScale.domain,
            dim: node.y,
            categories: categories,
            size: options.height
        });
        /* jshint ignore:end */
        calculateX = isMeasure(node.x) ? (d) => xScale(Math.min(startPoint, d[node.x.scaleDim])) : 0;
        calculateY = (d) =>  yScale(d[node.y.scaleDim]) - (tickWidth / 2);
        calculateWidth = isMeasure(node.x) ? (d) => Math.abs(xScale(d[node.x.scaleDim]) - xScale(startPoint)) : (d) => xScale(d[node.x.scaleDim]);
        calculateHeight = (d)=> intervalWidth;
        calculateTranslate = (d, index) => utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2);

    } else {

        var yMin = Math.min.apply(null, yScale.domain());
        let startPoint = (yMin <= 0) ? 0 : yMin;

        /* jshint ignore:start */
        var {tickWidth,intervalWidth, offsetCategory} = getSizesParams({
            domain: xScale.domain,
            dim: node.x,
            categories: categories,
            size: options.width
        });
        /* jshint ignore:end */
        calculateX = (d) => xScale(d[node.x.scaleDim]) - (tickWidth / 2);
        calculateY = isMeasure(node.y) ?
            (d) => yScale(Math.max(startPoint, d[node.y.scaleDim])) :
            (d) => yScale(d[node.y.scaleDim]);

        calculateWidth = (d)=> intervalWidth;
        calculateHeight = isMeasure(node.y) ?
            (d) => Math.abs(yScale(d[node.y.scaleDim]) - yScale(startPoint)) :
            (d) => (options.height - yScale(d[node.y.scaleDim]));
        calculateTranslate = (d, index) => utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);
    }

    var updateBar = function () {
        return this
            .attr('class', (d) => ('i-role-datum bar ' + CSS_PREFIX + 'bar ' + color.get(d[color.dimension])))
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