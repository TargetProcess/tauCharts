import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';

var translate = (left, top) => 'translate(' + left + ',' + top + ')';
var rotate = (angle) => 'rotate(' + angle + ')';
var getOrientation = (scaleOrient) => _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';
var s;

var cutText = (textString, widthLimit) => {
    textString.each(function () {
        var textD3 = d3.select(this);
        var tokens = textD3.text().split(/\s+/).reverse();

        textD3.text(null);

        var line = [];
        var word;
        var stop = false;
        while (!stop && (word = tokens.pop())) {
            line.push(word);
            textD3.text(line.join(' '));
            if (textD3.node().getComputedTextLength() > widthLimit) {

                line.pop();

                var str = line.join(' ');
                str += '...';

                textD3.text(str);

                stop = true;
            }
        }
    });
};

var wrapText = (textString, widthLimit, linesLimit) => {
    textString.each(function () {
        var textD3 = d3.select(this),
            tokens = textD3.text().split(/\s+/).reverse(),
            lineHeight = 1.1, // ems
            y = textD3.attr('y'),
            dy = parseFloat(textD3.attr('dy'));

        textD3.text(null);
        var tspan = textD3.append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

        var line = [];
        var word;
        var lineNumber = 0;
        while ((lineNumber < linesLimit) && (word = tokens.pop())) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > widthLimit) {

                line.pop();

                var str = line.join(' ');
                str += ((lineNumber === (linesLimit - 1)) ? '...' : '');

                tspan.text(str);

                // start new line
                ++lineNumber;
                line = [word];
                var dyNew = lineNumber * lineHeight + dy;
                tspan = textD3.append('tspan').attr('x', 0).attr('y', y).attr('dy', dyNew + 'em');
            }
        }
    });
};

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

    var angle = x.guide.rotate;

    var ticks = nodeScale.selectAll('.tick text');
    ticks
        .attr('transform', rotate(angle))
        .style('text-anchor', x.guide.textAnchor);

    if (angle === 90) {
        ticks.attr('x', 9).attr('y', 0);
    }
};

var fnDrawDimAxis = function (x, AXIS_POSITION, size) {
    var container = this;
    if (x.scaleDim) {

        var axisScale = d3.svg.axis()
            .scale(x.scaleObj)
            .orient(x.guide.scaleOrient)
            .ticks(Math.round(size / x.guide.density));

        axisScale.tickFormat(FormatterRegistry.get(x.guide.tickFormat));

        var nodeScale = container
            .append('g')
            .attr('class', x.guide.cssClass)
            .attr('transform', translate.apply(null, AXIS_POSITION))
            .call(axisScale);

        decorateAxisTicks(nodeScale, x, size);
        decorateTickLabel(nodeScale, x);
        decorateAxisLabel(nodeScale, x);

        if (x.guide.tickFormatWordWrap) {
            nodeScale
                .selectAll('.tick text')
                .call(wrapText, x.guide.tickFormatWordWrapLimit, x.guide.tickFormatWordWrapLines);
        }
        else {
            nodeScale
                .selectAll('.tick text')
                .call(cutText, x.guide.tickFormatWordWrapLimit);
        }
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
                .ticks(Math.round(W / x.guide.density));

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
                .ticks(Math.round(H / y.guide.density));

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
    var colorGuide = node.guide.color || {};
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

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

    node.guide.x = _.defaults(node.guide.x || {}, {
        label: '',
        padding: 0,
        density: 30,
        cssClass: 'x axis',
        scaleOrient: 'bottom',
        rotate: 0,
        textAnchor: 'middle',
        tickPeriod: null,
        tickFormat: null,
        autoScale: true
    });
    node.guide.x.label = _.isObject(node.guide.x.label) ? node.guide.x.label : {text: node.guide.x.label};
    node.guide.x.label = _.defaults(node.guide.x.label, {padding: 32, rotate: 0, textAnchor: 'middle'});

    node.guide.x.tickFormat = node.guide.x.tickFormat || node.guide.x.tickPeriod;

    node.guide.y = _.defaults(node.guide.y || {}, {
        label: '',
        padding: 0,
        density: 30,
        cssClass: 'y axis',
        scaleOrient: 'left',
        rotate: 0,
        textAnchor: 'end',
        tickPeriod: null,
        tickFormat: null,
        autoScale: true
    });
    node.guide.y.label = _.isObject(node.guide.y.label) ? node.guide.y.label : {text: node.guide.y.label};
    node.guide.y.label = _.defaults(node.guide.y.label, {padding: 32, rotate: -90, textAnchor: 'middle'});

    node.guide.y.tickFormat = node.guide.y.tickFormat || node.guide.y.tickPeriod;

    return node;
};

/* jshint ignore:start */
var utilsDraw = {
    translate,
    rotate,
    getOrientation,
    fnDrawDimAxis,
    fnDrawGrid,
    generateColor,
    applyNodeDefaults
};
/* jshint ignore:end */

export {utilsDraw};