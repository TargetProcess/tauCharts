import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

var d3getComputedTextLength = _.memoize(
    (d3Text) => d3Text.node().getComputedTextLength(),
    (d3Text) => d3Text.node().textContent.length);

var cutText = (textString, widthLimit, getComputedTextLength) => {

    getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

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
            } else {
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

    getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

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

var d3_decorator_prettify_categorical_axis_ticks = (nodeAxis, size, isHorizontal) => {

    var selection = nodeAxis.selectAll('.tick line');
    if (selection.empty()) {
        return;
    }

    var sectorSize = size / selection[0].length;
    var offsetSize = sectorSize / 2;

    var key = (isHorizontal) ? 'x' : 'y';
    var val = (isHorizontal) ? offsetSize : (-offsetSize);

    selection.attr(key + '1', val).attr(key + '2', val);
};

var d3_decorator_fix_horizontal_axis_ticks_overflow = (axisNode) => {

    var timeTicks = axisNode.selectAll('.tick')[0];
    if (timeTicks.length < 2) {
        return;
    }

    var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace('translate(', ''));
    var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace('translate(', ''));

    var tickStep = tick1 - tick0;

    var maxTextLn = 0;
    var iMaxTexts = -1;
    var timeTexts = axisNode.selectAll('.tick text')[0];
    timeTexts.forEach((textNode, i) => {
        var innerHTML = textNode.textContent || '';
        var textLength = innerHTML.length;
        if (textLength > maxTextLn) {
            maxTextLn = textLength;
            iMaxTexts = i;
        }
    });

    if (iMaxTexts >= 0) {
        var rect = timeTexts[iMaxTexts].getBoundingClientRect();
        // 2px from each side
        if ((tickStep - rect.width) < 8) {
            axisNode.classed({'graphical-report__d3-time-overflown': true});
        }
    }
};

var d3_decorator_fix_axis_bottom_line = (axisNode, size, isContinuesScale) => {

    var selection = axisNode.selectAll('.tick line');
    if (selection.empty()) {
        return;
    }

    var tickOffset = -1;

    if (isContinuesScale) {
        tickOffset = 0;
    } else {
        var sectorSize = size / selection[0].length;
        var offsetSize = sectorSize / 2;
        tickOffset = (-offsetSize);
    }

    var tickGroupClone = axisNode.select('.tick').node().cloneNode(true);
    axisNode
        .append(() => tickGroupClone)
        .attr('transform', utilsDraw.translate(0, size - tickOffset));
};

var d3_decorator_prettify_axis_label = (axisNode, guide, isHorizontal) => {

    var koeff = (isHorizontal) ? 1 : -1;
    var labelTextNode = axisNode
        .append('text')
        .attr('transform', utilsDraw.rotate(guide.rotate))
        .attr('class', guide.cssClass)
        .attr('x', koeff * guide.size * 0.5)
        .attr('y', koeff * guide.padding)
        .style('text-anchor', guide.textAnchor);

    var delimiter = ' > ';
    var tags = guide.text.split(delimiter);
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

    if (guide.dock === 'right') {
        let box = axisNode.selectAll('path.domain').node().getBBox();
        labelTextNode.attr('x', isHorizontal ? (box.width) : 0);
    } else if (guide.dock === 'left') {
        let box = axisNode.selectAll('path.domain').node().getBBox();
        labelTextNode.attr('x', isHorizontal ? 0 : (-box.height));
    }
};

var d3_decorator_wrap_tick_label = (nodeScale, guide, isHorizontal) => {

    var angle = guide.rotate;

    var ticks = nodeScale.selectAll('.tick text');
    ticks
        .attr('transform', utilsDraw.rotate(angle))
        .style('text-anchor', guide.textAnchor);

    if (angle === 90) {
        var dy = parseFloat(ticks.attr('dy')) / 2;
        ticks.attr('x', 9).attr('y', 0).attr('dy', `${dy}em`);
    }

    if (guide.tickFormatWordWrap) {
        ticks.call(
            wrapText,
            guide.tickFormatWordWrapLimit,
            guide.tickFormatWordWrapLines,
            guide.$maxTickTextH,
            !isHorizontal
        );
    } else {
        ticks
            .call(cutText, guide.tickFormatWordWrapLimit);
    }
};

export class Cartesian {

    constructor(config) {
        super();

        this.config = config;

        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                showGridLines: 'xy',
                padding: {l: 50, r: 0, t: 0, b: 50}
            });

        this.config.guide.x = this.config.guide.x || {};
        this.config.guide.x = _.defaults(
            this.config.guide.x,
            {
                cssClass: 'x axis',
                textAnchor: 'middle',
                padding: 10,
                hide: false,
                scaleOrient: 'bottom',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            }
        );

        this.config.guide.x.label = _.defaults(
            this.config.guide.x.label,
            {
                text: 'X',
                rotate: 0,
                padding: 40,
                textAnchor: 'middle'
            }
        );

        this.config.guide.y = this.config.guide.y || {};
        this.config.guide.y = _.defaults(
            this.config.guide.y,
            {
                cssClass: 'y axis',
                textAnchor: 'start',
                padding: 10,
                hide: false,
                scaleOrient: 'left',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

        this.config.guide.y.label = _.defaults(
            this.config.guide.y.label,
            {
                text: 'Y',
                rotate: -90,
                padding: 20,
                textAnchor: 'middle'
            }
        );

        var unit = this.config;
        if (unit.guide.autoLayout === 'extract-axes') {
            var containerHeight = unit.options.containerHeight;
            var guide = unit.guide = unit.guide || {};
            guide.x.hide = ((unit.options.top + unit.options.height) < containerHeight);
            guide.y.hide = ((unit.options.left > 0));
        }
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
        this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

        this.W = innerWidth;
        this.H = innerHeight;

        return this;
    }

    drawFrames(frames, continuation) {

        var node = _.extend({}, this.config);

        var options = node.options;
        var padding = node.guide.padding;

        var innerLeft = options.left + padding.l;
        var innerTop = options.top + padding.t;

        var innerWidth = this.W;
        var innerHeight = this.H;

        node.x = this.xScale;
        node.y = this.yScale;

        node.x.scaleObj = this.xScale;
        node.y.scaleObj = this.yScale;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        node.x.guide.label.size = innerWidth;
        node.y.guide.label.size = innerHeight;

        options
            .container
            .attr('transform', utilsDraw.translate(innerLeft, innerTop));

        var hashX = node.x.getHash();
        var hashY = node.y.getHash();

        if (!node.x.guide.hide) {
            this._fnDrawDimAxis(
                options.container,
                node.x,
                [0, innerHeight + node.guide.x.padding],
                innerWidth,
                (`${options.frameId}x`),
                hashX
            );
        }

        if (!node.y.guide.hide) {
            this._fnDrawDimAxis(
                options.container,
                node.y,
                [0 - node.guide.y.padding, 0],
                innerHeight,
                (`${options.frameId}y`),
                hashY
            );
        }

        var updateCellLayers = (cellId, cell, frame) => {

            var mapper;
            var frameId = frame.hash();
            if (frame.key) {

                var coordX = node.x(frame.key[node.x.dim]);
                var coordY = node.y(frame.key[node.y.dim]);

                var xDomain = node.x.domain();
                var yDomain = node.y.domain();

                var xPart = innerWidth / xDomain.length;
                var yPart = innerHeight / yDomain.length;

                mapper = (unit, i) => {
                    unit.options = {
                        uid: frameId + i,
                        frameId: frameId,
                        container: cell,
                        containerWidth: innerWidth,
                        containerHeight: innerHeight,
                        left: coordX - xPart / 2,
                        top: coordY - yPart / 2,
                        width: xPart,
                        height: yPart
                    };
                    return unit;
                };
            } else {
                mapper = (unit, i) => {
                    unit.options = {
                        uid: frameId + i,
                        frameId: frameId,
                        container: cell,
                        containerWidth: innerWidth,
                        containerHeight: innerHeight,
                        left: 0,
                        top: 0,
                        width: innerWidth,
                        height: innerHeight
                    };
                    return unit;
                };
            }

            var continueDrawUnit = function (unit) {
                unit.options.container = d3.select(this);
                continuation(unit, frame);
            };

            var layers = cell
                .selectAll(`.layer_${cellId}`)
                .data(frame.units.map(mapper), (unit) => (unit.options.uid + unit.type));
            layers
                .exit()
                .remove();
            layers
                .each(continueDrawUnit);
            layers
                .enter()
                .append('g')
                .attr('class', `layer_${cellId}`)
                .each(continueDrawUnit);
        };

        var cellFrameIterator = function (cellFrame) {
            updateCellLayers(options.frameId, d3.select(this), cellFrame);
        };

        var cells = this
            ._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId, hashX + hashY)
            .selectAll(`.parent-frame-${options.frameId}`)
            .data(frames, (f) => f.hash());
        cells
            .exit()
            .remove();
        cells
            .each(cellFrameIterator);
        cells
            .enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell parent-frame-${options.frameId} frame-${d.hash()}`))
            .each(cellFrameIterator);
    }

    _fnDrawDimAxis(container, scale, position, size, frameId, uniqueHash) {

        if (scale.scaleDim) {

            var axisScale = d3.svg
                .axis()
                .scale(scale.scaleObj)
                .orient(scale.guide.scaleOrient);

            var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
            if (formatter !== null) {
                axisScale.ticks(Math.round(size / scale.guide.density));
                axisScale.tickFormat(formatter);
            }

            var axis = container
                .selectAll('.axis_' + frameId)
                .data([uniqueHash], (x) => x);
            axis.exit()
                .remove();
            axis.enter()
                .append('g')
                .attr('class', scale.guide.cssClass + ' axis_' + frameId)
                .attr('transform', utilsDraw.translate(...position))
                .call(function (refAxisNode) {
                    if (!refAxisNode.empty()) {

                        axisScale.call(this, refAxisNode);

                        var isHorizontal = (utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h');
                        var prettifyTick = (scale.scaleType === 'ordinal' || scale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(refAxisNode, size, isHorizontal);
                        }

                        d3_decorator_wrap_tick_label(refAxisNode, scale.guide, isHorizontal);
                        d3_decorator_prettify_axis_label(refAxisNode, scale.guide.label, isHorizontal);

                        if (isHorizontal && (scale.scaleType === 'time')) {
                            d3_decorator_fix_horizontal_axis_ticks_overflow(refAxisNode);
                        }
                    }
                });
        }
    }

    _fnDrawGrid(container, node, height, width, frameId, uniqueHash) {

        var grid = container
            .selectAll('.grid_' + frameId)
            .data([uniqueHash], (x) => x);
        grid.exit()
            .remove();
        grid.enter()
            .append('g')
            .attr('class', 'grid grid_' + frameId)
            .attr('transform', utilsDraw.translate(0, 0))
            .call((selection) => {

                if (selection.empty()) {
                    return;
                }

                var grid = selection;

                var linesOptions = (node.guide.showGridLines || '').toLowerCase();
                if (linesOptions.length > 0) {

                    var gridLines = grid.append('g').attr('class', 'grid-lines');

                    if ((linesOptions.indexOf('x') > -1) && node.x.scaleDim) {
                        let xScale = node.x;
                        var xGridAxis = d3.svg
                            .axis()
                            .scale(xScale.scaleObj)
                            .orient(xScale.guide.scaleOrient)
                            .tickSize(height);

                        let formatter = FormatterRegistry.get(xScale.guide.tickFormat);
                        if (formatter !== null) {
                            xGridAxis.ticks(Math.round(width / xScale.guide.density));
                            xGridAxis.tickFormat(formatter);
                        }

                        var xGridLines = gridLines
                            .append('g')
                            .attr('class', 'grid-lines-x')
                            .call(xGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (xScale.scaleType === 'ordinal' || xScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(xGridLines, width, isHorizontal);
                        }

                        var firstXGridLine = xGridLines.select('g.tick');
                        if (firstXGridLine.node() && firstXGridLine.attr('transform') !== 'translate(0,0)') {
                            var zeroNode = firstXGridLine.node().cloneNode(true);
                            gridLines.node().appendChild(zeroNode);
                            d3.select(zeroNode)
                                .attr('class', 'border')
                                .attr('transform', utilsDraw.translate(0, 0))
                                .select('line')
                                .attr('x1', 0)
                                .attr('x2', 0);
                        }
                    }

                    if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
                        let yScale = node.y;
                        var yGridAxis = d3.svg
                            .axis()
                            .scale(yScale.scaleObj)
                            .orient(yScale.guide.scaleOrient)
                            .tickSize(-width);

                        let formatter = FormatterRegistry.get(yScale.guide.tickFormat);
                        if (formatter !== null) {
                            yGridAxis.ticks(Math.round(height / yScale.guide.density));
                            yGridAxis.tickFormat(formatter);
                        }

                        var yGridLines = gridLines
                            .append('g')
                            .attr('class', 'grid-lines-y')
                            .call(yGridAxis);

                        let isHorizontal = (utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h');
                        let prettifyTick = (yScale.scaleType === 'ordinal' || yScale.scaleType === 'period');
                        if (prettifyTick) {
                            d3_decorator_prettify_categorical_axis_ticks(yGridLines, height, isHorizontal);
                        }

                        let fixLineScales = ['time', 'ordinal', 'period'];
                        let fixBottomLine = _.contains(fixLineScales, yScale.scaleType);
                        if (fixBottomLine) {
                            d3_decorator_fix_axis_bottom_line(yGridLines, height, (yScale.scaleType === 'time'));
                        }
                    }

                    gridLines.selectAll('text').remove();
                }
            });

        return grid;
    }
}