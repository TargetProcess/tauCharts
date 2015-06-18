import {utilsDraw} from '../utils/utils-draw';
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

var d3_decorator_prettify_categorical_axis_ticks = (nodeAxis, logicalScale, isHorizontal) => {

    if (nodeAxis.selectAll('.tick line').empty()) {
        return;
    }

    nodeAxis
        .selectAll('.tick')[0]
        .forEach((node) => {

            var tickNode = d3.select(node);
            var tickData = tickNode.data()[0];

            var coord = logicalScale(tickData);
            var tx = (isHorizontal) ? coord : 0;
            var ty = (isHorizontal) ? 0 : coord;
            tickNode.attr('transform', `translate(${tx},${ty})`);

            var offset = logicalScale.stepSize(tickData) * 0.5;
            var key = (isHorizontal) ? 'x' : 'y';
            var val = (isHorizontal) ? offset : (-offset);
            tickNode.select('line').attr(key + '1', val).attr(key + '2', val);
        });
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

var d3_decorator_avoid_labels_collisions = (nodeScale) => {
    const textOffsetStep = 11;
    const refOffsetStart = -10;
    var layoutModel = [];
    nodeScale
        .selectAll('.tick')
        .each(function (a, i) {
            var tick = d3.select(this);
            var text = tick.text();
            var translateX = parseFloat(tick.attr('transform').replace('translate(', '').split(',')[0]);
            var tText = tick.selectAll('text');
            var tSpan = tText.selectAll('tspan');
            var tNode = tSpan.empty() ? tText : tSpan;

            var textWidth = tNode.node().getBBox().width;

            var halfText = (textWidth / 2);
            var s = translateX - halfText;
            var e = translateX + halfText;
            layoutModel.push({s: s, e: e, l: 0, textRef: tNode, tickRef: tick});
        });

    var iterateByTriples = (coll, iterator) => {
        return coll.map((curr, i, list) => {
            return iterator(
                list[i - 1] || {e: -Infinity, s: -Infinity, l: 0},
                curr,
                list[i + 1] || {e: Infinity, s: Infinity, l: 0}
            );
        });
    };

    var resolveCollide = (prevLevel, prevCollide) => {

        var rules = {
            '[T][1]': -1,
            '[T][-1]': 0,
            '[T][0]': 1,
            '[F][0]': -1
        };

        var k = `[${prevCollide.toString().toUpperCase().charAt(0)}][${prevLevel}]`;

        return (rules.hasOwnProperty(k)) ? rules[k] : 0;
    };

    iterateByTriples(layoutModel, (prev, curr, next) => {

        var collideL = (prev.e > curr.s);
        var collideR = (next.s < curr.e);

        if (collideL || collideR) {
            curr.l = resolveCollide(prev.l, collideL);

            var oldY = parseFloat(curr.textRef.attr('y'));

            var newY = oldY + (curr.l * textOffsetStep); // -1 | 0 | +1

            curr.textRef.attr('y', newY);
            curr.tickRef
                .append('line')
                .attr('class', 'label-ref')
                .attr({
                    x1: 0,
                    x2: 0,
                    y1: newY - 1,
                    y2: refOffsetStart
                });
        }

        return curr;
    });
};

export {
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_bottom_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoid_labels_collisions,
    wrapText,
    cutText
};