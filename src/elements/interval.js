import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';

const BAR_GROUP = 'i-role-bar-group';

var isMeasure = (dim) => dim.dimType === 'measure';

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

    var xScale = options.xScale,
        yScale = options.yScale,
        color = options.color,
        calculateX,
        calculateY,
        calculateWidth,
        calculateHeight,
        calculateTranslate;

    var minimalHeight = 1;

    var categories = node.groupBy(node.partition(), color.dimension);

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
        calculateX = isMeasure(node.x) ?
            ((d) => {
                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startPoint));
                var dotX = xScale(Math.min(startPoint, valX));

                var delta = (h - minimalHeight);
                var isTooSmall = (delta < 0);
                var offset = 0;
                if (valX > 0) {
                    offset = minimalHeight + delta;
                }

                if (valX < 0) {
                    offset = -minimalHeight;
                }

                return (!isTooSmall) ?
                    (dotX) :
                    (dotX + offset);
            }) :
            0;
        calculateY = (d) =>  yScale(d[node.y.scaleDim]) - (tickWidth / 2);
        calculateWidth = isMeasure(node.x) ?
            ((d) => {
                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startPoint));
                return (valX === 0) ? h : Math.max(minimalHeight, h);
            }) :
            ((d) => xScale(d[node.x.scaleDim]));
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
            ((d) => {
                var valY = d[node.y.scaleDim];
                var dotY = yScale(Math.max(startPoint, valY));
                var h = Math.abs(yScale(valY) - yScale(startPoint));
                var isTooSmall = (h < minimalHeight);
                return (isTooSmall && (valY > 0)) ? (dotY - minimalHeight) : dotY;
            }) :
            ((d) => yScale(d[node.y.scaleDim]));

        calculateWidth = (d)=> intervalWidth;
        calculateHeight = isMeasure(node.y) ?
            ((d) => {
                var valY = d[node.y.scaleDim];
                var h = Math.abs(yScale(valY) - yScale(startPoint));
                return (valY === 0) ? h : Math.max(minimalHeight, h);
            }) :
            ((d) => (options.height - yScale(d[node.y.scaleDim])));
        calculateTranslate = (d, index) => utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);
    }

    var updateBar = function () {
        return this
            .attr('class', (d) => ('i-role-element i-role-datum bar ' + CSS_PREFIX + 'bar ' + color.get(d[color.dimension])))
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