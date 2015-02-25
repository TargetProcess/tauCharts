import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {FormatterRegistry} from '../formatter-registry';
import {default as _} from 'underscore';
import {default as d3} from 'd3';


var translate = (left, top) => 'translate(' + left + ',' + top + ')';
var rotate = (angle) => 'rotate(' + angle + ')';
var getOrientation = (scaleOrient) => _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';

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

var decorateAxisTicks = (nodeScale, x, size) => {

    var selection = nodeScale.selectAll('.tick line');

    var sectorSize = size / selection[0].length;
    var offsetSize = sectorSize / 2;

    var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

    if (x.scaleType === 'ordinal' || x.scaleType === 'period') {

        var key = (isHorizontal) ? 'x' : 'y';
        var val = (isHorizontal) ? offsetSize : (-offsetSize);

        selection.attr(key + '1', val).attr(key + '2', val);
    }
};

var fixAxisTickOverflow = (nodeScale, x) => {

    var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

    if (isHorizontal && (x.scaleType === 'time')) {
        var timeTicks = nodeScale.selectAll('.tick')[0];
        if (timeTicks.length < 2) {
            return;
        }

        var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace('translate(', ''));
        var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace('translate(', ''));

        var tickStep = tick1 - tick0;

        var maxTextLn = 0;
        var iMaxTexts = -1;
        var timeTexts = nodeScale.selectAll('.tick text')[0];
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
                nodeScale.classed({'graphical-report__d3-time-overflown': true});
            }
        }
    }
};

var fixAxisBottomLine = (nodeScale, x, size) => {

    var selection = nodeScale.selectAll('.tick line');

    var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

    if (isHorizontal) {
        return;
    }

    var doApply = false;
    var tickOffset = -1;

    if (x.scaleType === 'time') {
        doApply = true;
        tickOffset = 0;
    }
    else if (x.scaleType === 'ordinal' || x.scaleType === 'period') {
        doApply = true;
        var sectorSize = size / selection[0].length;
        var offsetSize = sectorSize / 2;
        tickOffset = (-offsetSize);
    }

    if (doApply) {
        var tickGroupClone = nodeScale.select('.tick').node().cloneNode(true);
        nodeScale
            .append(() => tickGroupClone)
            .attr('transform', translate(0, size - tickOffset));
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
        var dy = parseFloat(ticks.attr('dy')) / 2;
        ticks.attr('x', 9).attr('y', 0).attr('dy', `${dy}em`);
    }

    if (x.guide.tickFormatWordWrap) {
        ticks
            .call(wrapText, x.guide.tickFormatWordWrapLimit, x.guide.tickFormatWordWrapLines, x.guide.$maxTickTextH, !isHorizontal);
    } else {
        ticks
            .call(cutText, x.guide.tickFormatWordWrapLimit);
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
            var containerBox = unit.options.container.node().getBBox();
            var guide = unit.guide = unit.guide || {};
            guide.x.hide = ((unit.options.top + unit.options.height) < containerBox.height);
            guide.y.hide = ((unit.options.left > 0));
        }
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        this.x = this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
        this.y = this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

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

        node.x.guide.size = innerWidth;
        node.y.guide.size = innerHeight;

        options.container
            .attr('transform', utilsDraw.translate(innerLeft, innerTop));
        //.attr('opacity', 0.5)
        //.transition()
        //.duration(500)
        //.attr('opacity', 1);

        if (!node.x.guide.hide) {
            this._fnDrawDimAxis(options.container, node.x, [0, innerHeight + node.guide.x.padding], innerWidth, options.frameId + 'x');
        }

        if (!node.y.guide.hide) {
            this._fnDrawDimAxis(options.container, node.y, [0 - node.guide.y.padding, 0], innerHeight, options.frameId + 'y');
        }

        this.grid = this._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId);

        var self = this;

        var updateHandler = (cell) => {

            var gridCells = cell[0];

            gridCells.forEach(function (cellNode) {
                var cell = d3.select(cellNode);
                var frames = cell.data();
                frames.reduce(
                    (units, frame) => {
                        var mapper;
                        if (frame.key) {

                            var coordX = self.x(frame.key[self.x.dim]);
                            var coordY = self.y(frame.key[self.y.dim]);

                            var xDomain = self.x.domain();
                            var yDomain = self.y.domain();

                            var xPart = self.W / xDomain.length;
                            var yPart = self.H / yDomain.length;

                            var frameId = fnBase64(frame);

                            mapper = (unit) => {
                                unit.options = {
                                    frameId: frameId,
                                    //container   : self.grid.select(`.frame-${frameId}`),
                                    container: cell,
                                    left: coordX - xPart / 2,
                                    top: coordY - yPart / 2,
                                    width: xPart,
                                    height: yPart
                                };
                                return unit;
                            };
                        }
                        else {
                            mapper = (unit) => {
                                unit.options = {
                                    container: cell,
                                    left: 0,
                                    top: 0,
                                    width: self.W,
                                    height: self.H
                                };
                                return unit;
                            };
                        }

                        frame.unit.map((u) => continuation(mapper(u), frame));

                        return units.concat(frame.unit.map(mapper));
                    },
                    []);
            });
        };

        var fnBase64 = (frame) => btoa(JSON.stringify(frame.key) + JSON.stringify(frame.source) + JSON.stringify(frame.pipe));

        var cells = this
            .grid
            .selectAll(`.parent-frame-${options.frameId}`)
            .data(frames, fnBase64);

        cells
            .enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell parent-frame-${options.frameId} frame-${fnBase64(d)}`))
            .call(updateHandler);

        cells
            .exit()
            .remove();

        cells.call(updateHandler);
    }

    _fnDrawDimAxis(container, x, AXIS_POSITION, size, S) {

        if (x.scaleDim) {

            var axisScale = d3.svg
                .axis()
                .scale(x.scaleObj)
                .orient(x.guide.scaleOrient);

            var formatter = FormatterRegistry.get(x.guide.tickFormat, x.guide.tickFormatNullAlias);
            if (formatter !== null) {
                axisScale.ticks(Math.round(size / x.guide.density));
                axisScale.tickFormat(formatter);
            }

            container.selectAll('.axis_' + S)
                .data([S])
                .enter()
                .append('g')
                .attr('class', x.guide.cssClass + ' axis_' + S)
                .attr('transform', utilsDraw.translate(...AXIS_POSITION))
                .call(function (selection) {
                    if (!selection.empty()) {
                        axisScale.call(this, selection);
                        decorateAxisTicks(selection, x, size);
                        decorateTickLabel(selection, x);
                        decorateAxisLabel(selection, x);
                        fixAxisTickOverflow(selection, x);
                    }
                });
        }
    }

    _fnDrawGrid(container, node, H, W, S) {

        container
            .selectAll('.grid_' + S)
            .data([S])
            .enter()
            .append('g')
            .attr('class', 'grid grid_' + S)
            .attr('transform', translate(0, 0));

        var grid = container.select('.grid_' + S);

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
                fixAxisBottomLine(yGridLines, y, H);
            }

            // TODO: make own axes and grid instead of using d3's in such tricky way
            gridLines.selectAll('text').remove();
        }

        return grid;
    }
}