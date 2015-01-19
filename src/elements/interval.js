import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';

const BAR_GROUP = 'i-role-bar-group';

var isMeasure = (dim) => dim.dimType === 'measure';

var getSizesParams = (params) => {
    var countDomainValue = params.domain().length;
    var countCategory = params.category.length;
    var tickWidth = params.size / countDomainValue;
    var intervalWidth = tickWidth / (countCategory + 1);
    return {
        tickWidth,
        intervalWidth,
        offsetCategory: intervalWidth
    };
};

var flipHub = {

    NORM: (node, xScale, yScale, width, height, defaultSizeParams, category) => {
        let minimalHeight = 1;
        let yMin = Math.min(...yScale.domain());
        let isYNumber = !isNaN(yMin);
        let startValue = (!isYNumber || (yMin <= 0)) ? 0 : yMin;
        let isXNumber = isMeasure(node.x);

        let {tickWidth, intervalWidth, offsetCategory} = isXNumber ?
            defaultSizeParams :
            getSizesParams({
                domain: xScale.domain,
                category: category,
                size: width
            });

        let calculateX = (d) => xScale(d[node.x.scaleDim]) - (tickWidth / 2);
        let calculateY = isYNumber ?
            ((d) => {
                var valY = d[node.y.scaleDim];
                var dotY = yScale(Math.max(startValue, valY));
                var h = Math.abs(yScale(valY) - yScale(startValue));
                var isTooSmall = (h < minimalHeight);
                return (isTooSmall && (valY > 0)) ? (dotY - minimalHeight) : dotY;
            }) :
            ((d) => yScale(d[node.y.scaleDim]));

        let calculateWidth = (d) => intervalWidth;
        let calculateHeight = isYNumber ?
            ((d) => {
                var valY = d[node.y.scaleDim];
                var h = Math.abs(yScale(valY) - yScale(startValue));
                return (valY === 0) ? h : Math.max(minimalHeight, h);
            }) :
            ((d) => (height - yScale(d[node.y.scaleDim])));

        let calculateTranslate = (d, index) => utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);

        return {calculateX, calculateY, calculateWidth, calculateHeight, calculateTranslate};
    },

    FLIP: (node, xScale, yScale, width, height, defaultSizeParams, category) => {
        let minimalHeight = 1;
        let xMin = Math.min(...xScale.domain());
        let isXNumber = !isNaN(xMin);
        let startValue = (!isXNumber || (xMin <= 0)) ? 0 : xMin;
        let isYNumber = isMeasure(node.y);

        let {tickWidth, intervalWidth, offsetCategory} = isYNumber ?
            defaultSizeParams :
            getSizesParams({
                domain: yScale.domain,
                category: category,
                size: height
            });

        let calculateX = isXNumber ?
            ((d) => {
                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startValue));
                var dotX = xScale(Math.min(startValue, valX));
                var delta = (h - minimalHeight);
                var offset = (valX > 0) ? (minimalHeight + delta) : ((valX < 0) ? (0 - minimalHeight) : 0);

                var isTooSmall = (delta < 0);
                return (isTooSmall) ? (dotX + offset) : (dotX);
            }) :
            0;
        let calculateY = (d) => yScale(d[node.y.scaleDim]) - (tickWidth / 2);
        let calculateWidth = isXNumber ?
            ((d) => {
                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startValue));
                return (valX === 0) ? h : Math.max(minimalHeight, h);
            }) :
            ((d) => xScale(d[node.x.scaleDim]));
        let calculateHeight = (d) => intervalWidth;
        let calculateTranslate = (d, index) => utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2);

        return {calculateX, calculateY, calculateWidth, calculateHeight, calculateTranslate};
    }
};

var interval = function (node) {

    var options = node.options;

    var xScale = options.xScale,
        yScale = options.yScale,
        colorScale = options.color;

    var categories = node.groupBy(node.partition(), node.color.scaleDim);
    var method = flipHub[node.flip ? 'FLIP' : 'NORM'];
    var facetNode = node.parentUnit.parentUnit || node.parentUnit;
    var {calculateX, calculateY, calculateWidth, calculateHeight, calculateTranslate} = method(
        node,
        xScale,
        yScale,
        options.width,
        options.height,
        {
            tickWidth: 5,
            intervalWidth: 5,
            offsetCategory: 0
        },
        node.groupBy(facetNode.partition(), node.color.scaleDim)
    );

    var updateBar = function () {
        return this
            .attr('height', calculateHeight)
            .attr('width', calculateWidth)
            .attr('class', (d) => (`i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[node.color.scaleDim])}`))
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

    var elements = options.container.selectAll(`.${BAR_GROUP}`).data(categories);
    elements.call(updateBarContainer);
    elements.enter().append('g').call(updateBarContainer);
    elements.exit().remove();
};

export {interval};