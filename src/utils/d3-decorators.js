import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
import {default as _} from 'underscore';
import {default as d3} from 'd3';
var selectOrAppend = utilsDom.selectOrAppend;

var d3getComputedTextLength = _.memoize(
    (d3Text) => d3Text.node().getComputedTextLength(),
    (d3Text) => d3Text.node().textContent.length);

var cutText = (textString, getScaleStepSize, getComputedTextLength) => {

    getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

    textString.each(function () {

        var tickNode = d3.select(this.parentNode);
        var tickData = tickNode.data()[0];
        var stepSize = getScaleStepSize(tickData);

        var textD3 = d3.select(this);
        var tokens = textD3.text().split(/\s+/);

        var stop = false;
        var parts = tokens.reduce((memo, t, i) => {

            if (stop) {
                return memo;
            }

            var text = (i > 0) ? [memo, t].join(' ') : t;
            var len = getComputedTextLength(textD3.text(text));
            if (len < stepSize) {
                memo = text;
            } else {
                var available = Math.floor(stepSize / len * text.length);
                memo = text.substr(0, available - 4) + '...';
                stop = true;
            }

            return memo;

        }, '');

        textD3.text(parts);
    });
};

var wrapText = (textNode, getScaleStepSize, linesLimit, tickLabelFontHeight, isY, getComputedTextLength) => {

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

        var tickNode = d3.select(this.parentNode);
        var tickData = tickNode.data()[0];
        var stepSize = getScaleStepSize(tickData);

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
                var over = tLen > stepSize;

                if (over && isLimit) {
                    var available = Math.floor(stepSize / tLen * text.length);
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

/**
 * Moves ticks from categories middle to categories top.
 */
var d3_decorator_prettify_categorical_axis_ticks = (nodeAxis, logicalScale, isHorizontal, animationSpeed) => {

    nodeAxis
        .selectAll('.tick')
        .each(function (tickData) {
            var coord = logicalScale(tickData);
            if (coord === undefined) {
                // Tick could be removed by D3 axis call during transition.
                return;
            }

            var tickNode = d3_transition(d3.select(this), animationSpeed);

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

/**
 * Adds extra tick to axis container.
 */
var d3_decorator_fix_axis_start_line = (
    axisNode,
    isHorizontal,
    width,
    height,
    animationSpeed
) => {

    var setTransform = (selection) => {
        selection.attr('transform', utilsDraw.translate(0, isHorizontal ? height : 0));
        return selection;
    };

    var setLineSize = (selection) => {
        if (isHorizontal) {
            selection.attr('x2', width);
        } else {
            selection.attr('y2', height);
        }
        return selection;
    };

    var tickClass = `js-extra${isHorizontal ? 'Y' : 'X'}Tick`;

    let extraTickNode = axisNode.selectAll(`.${tickClass}`);
    if (extraTickNode.empty()) {
        extraTickNode = axisNode.append('g')
            .classed(tickClass, true)
            .call(setTransform)
            .style('opacity', 1e-6);
        extraTickNode.append('line')
            .call(setLineSize);
    }
    d3_transition(extraTickNode, animationSpeed)
        .style('opacity', 1)
        .call(setTransform)
        .select('line')
        .call(setLineSize);
};

var d3_decorator_prettify_axis_label = (
    axisNode,
    guide,
    isHorizontal,
    size,
    animationSpeed
) => {

    var koeff = (isHorizontal) ? 1 : -1;
    var labelTextNode = selectOrAppend(axisNode, `text.js-axisLabel`)
        .attr('class', `js-axisLabel ${guide.cssClass}`)
        .attr('transform', utilsDraw.rotate(guide.rotate));

    var labelTextTrans = d3_transition(labelTextNode, animationSpeed)
        .attr('x', koeff * guide.size * 0.5)
        .attr('y', koeff * guide.padding)
        .style('text-anchor', guide.textAnchor);

    var delimiter = ' \u2192 ';
    var texts = ((parts) => {
        var result = [];
        for (var i = 0; i < parts.length - 1; i++) {
            result.push(parts[i], delimiter);
        }
        result.push(parts[i]);
        return result;
    })(guide.text.split(delimiter));

    var tspans = labelTextNode.selectAll('tspan')
        .data(texts);
    tspans.enter()
        .append('tspan')
        .attr('class', (d, i) => i % 2 ?
            ('label-token-delimiter label-token-delimiter-' + i) :
            ('label-token label-token-' + i))
        .text((d) => d);
    tspans.exit().remove();

    if (['left', 'right'].indexOf(guide.dock) >= 0) {
        let labelX = {
            left: [-size, 0],
            right: [0, size]
        };
        labelTextTrans.attr('x', labelX[guide.dock][Number(isHorizontal)]);
    }
};

var d3_decorator_wrap_tick_label = (nodeScale, guide, isHorizontal, logicalScale) => {

    var angle = utils.normalizeAngle(guide.rotate);

    var tick = nodeScale.selectAll('.tick text')
        .attr('transform', utilsDraw.rotate(angle))
        .style('text-anchor', guide.textAnchor);

    var segment = Math.abs(angle / 90);
    if ((segment % 2) > 0) {
        var kRot = angle < 180 ? 1 : -1;
        var k = isHorizontal ? 0.5 : -2;
        var dy = k * parseFloat(tick.attr('dy'));
        var attr = {
            x: 9 * kRot,
            y: 0,
            dx: (isHorizontal) ? null : `${dy}em`,
            dy: `${dy}em`
        };

        tick.attr(attr);
    }

    var limitFunc = (d) => Math.max(logicalScale.stepSize(d), guide.tickFormatWordWrapLimit);

    if (guide.tickFormatWordWrap) {
        tick.call(
            wrapText,
            limitFunc,
            guide.tickFormatWordWrapLines,
            guide.tickFontHeight,
            !isHorizontal
        );
    } else {
        tick.call(cutText, limitFunc, d3getComputedTextLength);
    }
};

var d3_decorator_avoid_labels_collisions = (nodeScale, isHorizontal) => {
    const textOffsetStep = 11;
    const refOffsetStart = isHorizontal ? -10 : 20;
    const translateParam = isHorizontal ? 0 : 1;
    const directionKoeff = isHorizontal ? 1 : -1;
    var layoutModel = [];
    nodeScale
        .selectAll('.tick')
        .each(function () {
            var tick = d3.select(this);

            var translateXStr = tick
                .attr('transform')
                .replace('translate(', '')
                .replace(' ', ',') // IE specific
                .split(',')
            [translateParam];

            var translateX = directionKoeff * parseFloat(translateXStr);
            var tNode = tick.selectAll('text');

            var textWidth = tNode.node().getBBox().width;

            var halfText = (textWidth / 2);
            var s = translateX - halfText;
            var e = translateX + halfText;
            layoutModel.push({c: translateX, s: s, e: e, l: 0, textRef: tNode, tickRef: tick});
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

    var axisLayoutModel = layoutModel.sort((a, b) => (a.c - b.c));

    iterateByTriples(axisLayoutModel, (prev, curr, next) => {

        var collideL = (prev.e > curr.s);
        var collideR = (next.s < curr.e);

        if (collideL || collideR) {

            curr.l = resolveCollide(prev.l, collideL);

            var size = curr.textRef[0].length;
            var text = curr.textRef.text();

            if (size > 1) {
                text = text.replace(/([\.]*$)/gi, '') + '...';
            }

            var oldY = parseFloat(curr.textRef.attr('y'));
            var newY = oldY + (curr.l * textOffsetStep); // -1 | 0 | +1

            curr.textRef
                .text((d, i) => i === 0 ? text : '')
                .attr('y', newY);

            var attrs = {
                x1: 0,
                x2: 0,
                y1: newY + (isHorizontal ? -1 : 5),
                y2: refOffsetStart
            };

            if (!isHorizontal) {
                attrs.transform = 'rotate(-90)';
            }

            curr.tickRef
                .append('line')
                .attr('class', 'label-ref')
                .attr(attrs);
        }

        return curr;
    });
};

var d3_transition = (selection, animationSpeed) => {
    if (animationSpeed > 0) {
        return selection.transition().duration(animationSpeed);
    }
    return selection;
};

var d3_animationInterceptor = (animationSpeed, initAttrs, doneAttrs, afterUpdate) => {

    var xAfterUpdate = afterUpdate || _.identity;

    return function () {
        var flow = this;

        if (initAttrs) {
            flow = flow.attr(_.defaults(initAttrs, doneAttrs));
        }

        flow = d3_transition(flow, animationSpeed);

        flow = flow.attr(doneAttrs);

        if (animationSpeed > 0) {
            flow.each('end', function () {
                xAfterUpdate(this);
            });
        } else {
            xAfterUpdate(flow.node());
        }

        return flow;
    };
};

export {
    d3_animationInterceptor,
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_start_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoid_labels_collisions,
    d3_transition,
    wrapText,
    cutText
};