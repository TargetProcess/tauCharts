import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';

var translate = (left, top) => 'translate(' + left + ',' + top + ')';
var rotate = (angle) => 'rotate(' + angle + ')';
var getOrientation = (scaleOrient) => _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';
var s;
var decorateAxisTicks = (nodeScale, x, size) => {

    var selection = nodeScale.selectAll('.tick line');

    var sectorSize = size / selection[0].length;
    var offsetSize = sectorSize / 2;

    if (x.scaleType === 'ordinal' || x.scaleType === 'period') {

        var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

        var key = (isHorizontal) ? 'x' : 'y';
        var val = (isHorizontal) ? offsetSize : (-offsetSize);

        selection.attr(key + '1', val).attr(key + '2', val);
    }
};

var decorateAxisLabel = (nodeScale, x) => {
    var koeff = ('h' === getOrientation(x.guide.scaleOrient)) ? 1 : -1;
    nodeScale
        .append('text')
        .attr('transform', rotate(x.guide.label.rotate))
        .attr('class', 'label')
        .attr('x', koeff * x.guide.size * 0.5)
        .attr('y', koeff * x.guide.label.padding)
        .style('text-anchor', x.guide.label.textAnchor)
        .text(x.guide.label.text);
};

var decorateTickLabel = (nodeScale, x) => {
    nodeScale
        .selectAll('.tick text')
        .attr('transform', rotate(x.guide.rotate))
        .style('text-anchor', x.guide.textAnchor);
};

var fnDrawDimAxis = function (x, AXIS_POSITION, size) {
    var container = this;
    if (x.scaleDim) {

        var axisScale = d3.svg.axis()
            .scale(x.scaleObj)
            .orient(x.guide.scaleOrient)
            .ticks(_.max([Math.round(size / x.guide.density), 4]));

        if (x.guide.tickFormat) {
            axisScale.tickFormat(FormatterRegistry.get(x.guide.tickFormat));
        }

        var nodeScale = container
            .append('g')
            .attr('class', x.guide.cssClass)
            .attr('transform', translate.apply(null, AXIS_POSITION))
            .call(axisScale);

        decorateAxisTicks(nodeScale, x, size);
        decorateTickLabel(nodeScale, x);
        decorateAxisLabel(nodeScale, x);
    }
};

var fnDrawGrid = function (node, H, W) {

    var container = this;

    var grid = container
        .append('g')
        .attr('class', 'grid')
        .attr('transform', translate(0, 0));

    var linesOptions = (node.guide.showGridLines || '').toLowerCase();
    if (linesOptions.length > 0) {

        var gridLines = grid.append('g').attr('class', 'grid-lines');

        if ((linesOptions.indexOf('x') > -1) && node.x.scaleDim) {
            var x = node.x;
            var xGridAxis = d3.svg
                .axis()
                .scale(x.scaleObj)
                .orient(x.guide.scaleOrient)
                .tickSize(H)
                .ticks(_.max([Math.round(W / x.guide.density), 4]));

            var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x').call(xGridAxis);

            decorateAxisTicks(xGridLines, x, W);
        }

        if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
            var y = node.y;
            var yGridAxis = d3.svg
                .axis()
                .scale(y.scaleObj)
                .orient(y.guide.scaleOrient)
                .tickSize(-W)
                .ticks(_.max([Math.round(H / y.guide.density), 4]));

            var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y').call(yGridAxis);

            decorateAxisTicks(yGridLines, y, H);
        }

        // TODO: make own axes and grid instead of using d3's in such tricky way
        gridLines.selectAll('text').remove();
    }

    return grid;
};

var generateColor = function (node) {
    var defaultRange = _.times(10, (i) => 'color10-' + (1 + i));
    var range, domain;
    var colorGuide = (node.guide || {}).color || {};
    var colorParam = node.color;

    var colorDim = colorParam.scaleDim;
    var brewer = colorGuide.brewer || defaultRange;

    if (utils.isArray(brewer)) {
        domain = node.domain(colorDim);
        range = brewer;
    }
    else {
        domain = Object.keys(brewer);
        range = domain.map((key) => brewer[key]);
    }

    return {
        get: (d) => d3.scale.ordinal().range(range).domain(domain)(d),
        dimension:colorDim
    };
};
/* jshint ignore:start */
var utilsDraw = {
    translate,
    rotate,
    getOrientation,
    fnDrawDimAxis,
    fnDrawGrid,
    generateColor
};
/* jshint ignore:end */

export {utilsDraw};