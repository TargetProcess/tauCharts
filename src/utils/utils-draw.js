import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';
/* jshint ignore:start */
import * as _ from 'underscore';
import * as d3 from 'd3';
/* jshint ignore:end */

var translate = (left, top) => 'translate(' + left + ',' + top + ')';
var rotate = (angle) => 'rotate(' + angle + ')';
var getOrientation = (scaleOrient) => _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';

var cutText = (textString, widthLimit, getComputedTextLength) => {

    getComputedTextLength = getComputedTextLength || ((d3Text) => d3Text.node().getComputedTextLength());

    textString.each(function () {
        var textD3 = d3.select(this);
        var tokens = textD3.text().split(/\s+/);

        var stop = false;
        var parts = tokens.reduce((memo, t, i) => {

            if (stop) {
                return memo;
            }

            var text = (i > 0) ? [memo, t].join(' ') : t;
            var len = getComputedTextLength(textD3.text(text));
            if (len < widthLimit) {
                memo = text;
            }
            else {
                var available = Math.floor(widthLimit / len * text.length);
                memo = text.substr(0, available - 4) + '...';
                stop = true;
            }

            return memo;

        }, '');

        textD3.text(parts);
    });
};

var wrapText = (textNode, widthLimit, linesLimit, tickLabelFontHeight, isY, getComputedTextLength) => {

    getComputedTextLength = getComputedTextLength || ((d3Text) => d3Text.node().getComputedTextLength());

    var addLine = (targetD3, text, lineHeight, x, y, dy, lineNumber) => {
        var dyNew = (lineNumber * lineHeight) + dy;
        return targetD3
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', dyNew + 'em')
            .text(text);
    };

    textNode.each(function () {
        var textD3 = d3.select(this),
            tokens = textD3.text().split(/\s+/),
            lineHeight = 1.1, // ems
            x = textD3.attr('x'),
            y = textD3.attr('y'),
            dy = parseFloat(textD3.attr('dy'));

        textD3.text(null);
        var tempSpan = addLine(textD3, null, lineHeight, x, y, dy, 0);

        var stopReduce = false;
        var tokensCount = (tokens.length - 1);
        var lines = tokens
            .reduce((memo, next, i) => {

                if (stopReduce) {
                    return memo;
                }

                var isLimit = (memo.length === linesLimit) || (i === tokensCount);
                var last = memo[memo.length - 1];
                var text = (last !== '') ? (last + ' ' + next) : next;
                var tLen = getComputedTextLength(tempSpan.text(text));
                var over = tLen > widthLimit;

                if (over && isLimit) {
                    var available = Math.floor(widthLimit / tLen * text.length);
                    memo[memo.length - 1] = text.substr(0, available - 4) + '...';
                    stopReduce = true;
                }

                if (over && !isLimit) {
                    memo.push(next);
                }

                if (!over) {
                    memo[memo.length - 1] = text;
                }

                return memo;

            }, [''])
            .filter((l) => l.length > 0);

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
    var orient = getOrientation(x.guide.scaleOrient);
    var koeff = ('h' === orient) ? 1 : -1;
    var labelTextNode = nodeScale
        .append('text')
        .attr('transform', rotate(x.guide.label.rotate))
        .attr('class', x.guide.label.cssClass)
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

    if (x.guide.label.dock === 'right') {
        let box = nodeScale.selectAll('path.domain').node().getBBox();
        labelTextNode.attr('x', (orient === 'h') ? (box.width) : 0);
    }
    else if (x.guide.label.dock === 'left') {
        let box = nodeScale.selectAll('path.domain').node().getBBox();
        labelTextNode.attr('x', (orient === 'h') ? 0 : (-box.height));
    }
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
    } else {
        ticks
            .call(cutText, x.guide.tickFormatWordWrapLimit);
    }
};

var fnDrawDimAxis = function (x, AXIS_POSITION, size) {
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
var generateColor = function (node) {
    var getClass;

    var colorGuide = node.guide.color || {};
    var colorDim = node.color.scaleDim;

    var buildArrayGetClass = function(brewer){
        var domain = node.domain(colorDim);
        if (domain.length === 0 || (domain.length === 1 && domain[0]===null)){
            return _.constant('color-default');
        } else {
            var fullDomain = domain.map((x) => String(x).toString());
            return d3.scale.ordinal().range(brewer).domain(fullDomain);
        }
    };

    var buildObjectGetClass = function(brewer, defaultGetClass){
        var domain = _.keys(brewer);
        var range = _.values(brewer);

        var calculateClass = d3.scale.ordinal().range(range).domain(domain);
        return (d) => domain.indexOf(d) > -1 ? calculateClass(d) : defaultGetClass(d);
    };

    var wrapString = (f)=>(d)=>f(String(d).toString());

    var brewer = colorGuide.brewer;
    if (!brewer) {
        getClass = wrapString(buildArrayGetClass(defaultRangeColor));
    } else if (_.isArray(brewer)) {
        getClass = wrapString(buildArrayGetClass(brewer));
    } else if (_.isFunction(brewer)) {
        var defaultBrewer = wrapString(buildArrayGetClass(defaultRangeColor));
        getClass = (d)=>brewer(d, defaultBrewer);
    } else if (_.isObject(brewer)) {
        getClass = buildObjectGetClass(brewer, _.constant('color-default'));
    } else {
        throw new Error('This brewer is not supported');
    }

    var valueMeta = node.scaleMeta(colorDim);
    var labelMeta = node.scaleMeta(colorDim, colorGuide);

    var group = (data)=>
        _.chain(data)
            .groupBy((item)=>valueMeta.extract(item[colorDim]))
            .map((values)=>({key: values[0][colorDim], values: values}))
            .value();

    return {
        get: getClass,
        dimension: colorDim,
        getValue: valueMeta.extract,
        getLabel: labelMeta.extract,
        group: group
    };
};
var extendLabel = function (guide, dimension, extend) {
    guide[dimension] = _.defaults(guide[dimension] || {}, {
        label: ''
    });
    guide[dimension].label = _.isObject(guide[dimension].label) ? guide[dimension].label : {text: guide[dimension].label};
    guide[dimension].label = _.defaults(
        guide[dimension].label,
        extend || {},
        {
            padding: 32,
            rotate: 0,
            textAnchor: 'middle',
            cssClass: 'label',
            dock: null
        }
    );

    return guide[dimension];
};
var extendAxis = function (guide, dimension, extend) {
    guide[dimension] = _.defaults(
        guide[dimension],
        extend || {},
        {
            padding: 0,
            density: 30,
            rotate: 0,
            tickPeriod: null,
            tickFormat: null,
            autoScale: true
        }
    );
    guide[dimension].tickFormat = guide[dimension].tickFormat || guide[dimension].tickPeriod;
    return guide[dimension];
};

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

    node.guide.x = extendLabel(node.guide, 'x');
    node.guide.x = extendAxis(node.guide, 'x', {
        cssClass: 'x axis',
        scaleOrient: 'bottom',
        textAnchor: 'middle'
    });

    node.guide.y = extendLabel(node.guide, 'y',{rotate: -90});
    node.guide.y = extendAxis(node.guide, 'y', {
        cssClass: 'y axis',
        scaleOrient: 'left',
        textAnchor: 'end'
    });

    node.guide.size = extendLabel(node.guide, 'size');
    node.guide.color = extendLabel(node.guide, 'color');


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
    applyNodeDefaults,
    cutText,
    wrapText
};
/* jshint ignore:end */

export {utilsDraw};
