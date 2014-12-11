import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';
/* jshint ignore:start */
import * as _ from 'underscore';
import * as d3 from 'd3';
/* jshint ignore:end */

var translate = (left, top) => 'translate(' + left + ',' + top + ')';
var rotate = (angle) => 'rotate(' + angle + ')';
var getOrientation = (scaleOrient) => _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';


var cutText = (textString, widthLimit) => {
    textString.each(function() {
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

var wrapText = (textNode, widthLimit, linesLimit, tickLabelFontHeight, isY) => {

    var addLine = (targetD3, text, lineHeight, x, y, dy, lineNumber) => {
        var dyNew = (lineNumber * lineHeight) + dy;
        var nodeX = targetD3.append('tspan').attr('x', x).attr('y', y).attr('dy', dyNew + 'em').text(text);
        return nodeX;
    };

    textNode.each(function() {
        var textD3 = d3.select(this),
            tokens = textD3.text().split(/\s+/),
            lineHeight = 1.1, // ems
            x = textD3.attr('x'),
            y = textD3.attr('y'),
            dy = parseFloat(textD3.attr('dy'));

        textD3.text(null);
        var tempSpan = addLine(textD3, null, lineHeight, x, y, dy, 0);

        var stopReduce = false;
        var lines = tokens.reduce(
            (memo, next) => {

                if (stopReduce) return memo;

                var isLimit = memo.length === linesLimit;
                var last = memo[memo.length - 1];
                var over = tempSpan.text(last + next).node().getComputedTextLength() > widthLimit;

                if (over && isLimit) {
                    memo[memo.length - 1] = last + '...';
                    stopReduce = true;
                }

                if (over && !isLimit) {
                    memo.push(next);
                }

                if (!over) {
                    memo[memo.length - 1] = last + ' ' + next;
                }

                return memo;

            },
            ['']);

        y = isY ? (-1 * (lines.length - 1) * Math.floor(tickLabelFontHeight * 0.5)) : y;
        lines.forEach((text, i) => addLine(textD3, text, lineHeight, x, y, dy, i));

        tempSpan.remove();
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
    var labelTextNode = nodeScale
        .append('text')
        .attr('transform', rotate(x.guide.label.rotate))
        .attr('class', 'label')
        .attr('x', koeff * x.guide.size * 0.5)
        .attr('y', koeff * x.guide.label.padding)
        .style('text-anchor', x.guide.label.textAnchor);

    var delimiter = ' > ';
    var tags = x.guide.label.text.split(delimiter);
    var tLen = tags.length;
    tags.forEach((token, i) => {

        labelTextNode
            .append('tspan')
            .attr('class', 'label-token label-token-' + i)
            .text(token);

        if (i < (tLen - 1)) {
            labelTextNode
                .append('tspan')
                .attr('class', 'label-token-delimiter label-token-delimiter-' + i)
                .text(delimiter);
        }
    });
};

var decorateTickLabel = (nodeScale, x) => {

    var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

    var angle = x.guide.rotate;

    var ticks = nodeScale.selectAll('.tick text');
    ticks
        .attr('transform', rotate(angle))
        .style('text-anchor', x.guide.textAnchor);

    if (angle === 90) {
        ticks.attr('x', 9).attr('y', 0);
    }

    if (x.guide.tickFormatWordWrap) {
        ticks
            .call(wrapText, x.guide.tickFormatWordWrapLimit, x.guide.tickFormatWordWrapLines, x.guide.$maxTickTextH, !isHorizontal);
    }
    else {
        ticks
            .call(cutText, x.guide.tickFormatWordWrapLimit);
    }
};

var fnDrawDimAxis = function(x, AXIS_POSITION, size) {
    var container = this;
    if (x.scaleDim) {

        var axisScale = d3.svg.axis()
            .scale(x.scaleObj)
            .orient(x.guide.scaleOrient);

        var formatter = FormatterRegistry.get(x.guide.tickFormat, x.guide.tickFormatNullAlias);
        if (formatter !== null) {
            axisScale.ticks(Math.round(size / x.guide.density));
            axisScale.tickFormat(formatter);
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

var fnDrawGrid = function(node, H, W) {

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
                .tickSize(H);

            let formatter = FormatterRegistry.get(x.guide.tickFormat);
            if (formatter !== null) {
                xGridAxis.ticks(Math.round(W / x.guide.density));
                xGridAxis.tickFormat(formatter);
            }

            var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x').call(xGridAxis);

            decorateAxisTicks(xGridLines, x, W);

            var firstXGridLine = xGridLines.select('g.tick');
            if (firstXGridLine.node() && firstXGridLine.attr('transform') !== 'translate(0,0)') {
                var zeroNode = firstXGridLine.node().cloneNode(true);
                gridLines.node().appendChild(zeroNode);
                d3.select(zeroNode)
                    .attr('class', 'border')
                    .attr('transform', translate(0, 0))
                    .select('line')
                    .attr('x1', 0)
                    .attr('x2', 0);
            }
        }

        if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
            var y = node.y;
            var yGridAxis = d3.svg
                .axis()
                .scale(y.scaleObj)
                .orient(y.guide.scaleOrient)
                .tickSize(-W);

            let formatter = FormatterRegistry.get(y.guide.tickFormat);
            if (formatter !== null) {
                yGridAxis.ticks(Math.round(H / y.guide.density));
                yGridAxis.tickFormat(formatter);
            }

            var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y').call(yGridAxis);

            decorateAxisTicks(yGridLines, y, H);
        }

        // TODO: make own axes and grid instead of using d3's in such tricky way
        gridLines.selectAll('text').remove();
    }

    return grid;
};
var defaultRangeColor = _.times(10, (i) => 'color10-' + (1 + i));
var generateColor = function(node) {
    var range, domain;
    var colorGuide = node.guide.color || {};
    var colorParam = node.color;

    var colorDim = colorParam.scaleDim;
    var brewer = colorGuide.brewer || defaultRangeColor;

    if (utils.isArray(brewer)) {
        domain = node.domain(colorDim).map((x) => String(x).toString());
        range = brewer;
    }
    else {
        domain = Object.keys(brewer);
        range = domain.map((key) => brewer[key]);
    }
    var calculateClass = d3.scale.ordinal().range(range).domain(domain);
    var getClass = (d) => domain.indexOf(d) > -1 ? calculateClass(d) : 'color-default';

    return {
        get: (d) => getClass(String(d).toString()),
        dimension: colorDim
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