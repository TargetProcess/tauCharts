import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
import {default as _} from 'underscore';
import {default as d3} from 'd3';
// TODO: Fix utilsDom export.
var selectOrAppend = utilsDom.selectOrAppend;
var classes = utilsDom.classes;

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
            // NOTE: Skip ticks removed by D3 axis call during transition.
            if (logicalScale(tickData)) {
                var tickNode = d3_transition(d3.select(this), animationSpeed);

                var offset = logicalScale.stepSize(tickData) * 0.5;
                var key = (isHorizontal) ? 'x' : 'y';
                var val = (isHorizontal) ? offset : (-offset);
                tickNode.select('line').attr(key + '1', val).attr(key + '2', val);
            }
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

    var hasOverflow = false;
    if (iMaxTexts >= 0) {
        var rect = timeTexts[iMaxTexts].getBoundingClientRect();
        hasOverflow = (tickStep - rect.width) < 8; // 2px from each side
    }
    axisNode.classed({'graphical-report__d3-time-overflown': hasOverflow});
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

    var tickClass = `tau-extra${isHorizontal ? 'Y' : 'X'}Tick`;
    var extraTick = selectOrAppend(axisNode, `g.${tickClass}`);
    var extraLine = selectOrAppend(extraTick, 'line');
    if (!extraTick.node().hasAttribute('opacity')) {
        extraTick.attr('opacity', 1e-6);
    }
    d3_transition(extraTick, animationSpeed).call(setTransform);
    d3_transition(extraLine, animationSpeed).call(setLineSize);
};

var d3_decorator_prettify_axis_label = (
    axisNode,
    guide,
    isHorizontal,
    size,
    animationSpeed
) => {

    var koeff = (isHorizontal) ? 1 : -1;
    var labelTextNode = selectOrAppend(axisNode, `text.label`)
        .attr('class', classes('label', guide.cssClass))
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

var d3_decorator_wrap_tick_label = (nodeScale, transScale, guide, isHorizontal, logicalScale) => {

    var angle = utils.normalizeAngle(guide.rotate);

    var tick = nodeScale.selectAll('.tick text')
        .attr('transform', utilsDraw.rotate(angle))
        .style('text-anchor', guide.textAnchor);

    // TODO: Improve indent calculation for ratated text.
    var segment = Math.abs(angle / 90);
    if ((segment % 2) > 0) {
        let kRot = angle < 180 ? 1 : -1;
        let k = isHorizontal ? 0.5 : -2;
        let sign = (guide.scaleOrient === 'top' || guide.scaleOrient === 'left' ? -1 : 1);
        let dy = (k * (guide.scaleOrient === 'bottom' || guide.scaleOrient === 'top' ?
            (sign < 0 ? 0 : 0.71) :
            0.32));
        let pt = {
            x: 9 * kRot,
            y: 0
        };
        let dpt = {
            dx: (isHorizontal) ? null : `${dy}em`,
            dy: `${dy}em`
        };

        nodeScale.selectAll('.tick text').attr(pt).attr(dpt);
        transScale.selectAll('.tick text').attr(pt);
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

            selectOrAppend(curr.tickRef, 'line.label-ref')
                .attr(attrs);
        } else {
            curr.tickRef.selectAll('line.label-ref').remove();
        }

        return curr;
    });
};

var d3_transition = (selection, animationSpeed, nameSpace) => {
    if (animationSpeed > 0) {
        selection = selection.transition(nameSpace).duration(animationSpeed);
        selection.attr = d3_transition_attr;
    }
    selection.onTransitionEnd = function (callback) {
        d3_add_transition_end_listener(this, callback);
        return this;
    };
    return selection;
};

// TODO: Getting attribute value may be possible in D3 v4:
// http://stackoverflow.com/a/39024812/4137472
// so it will be possible to get future attribute value.
var d3_transition_attr = function (keyOrMap, value) {
    if (arguments.length === 0) {
        throw new Error('Unexpected `transition().attr()` arguments.');
    }
    var attrs;
    if (arguments.length === 1) {
        attrs = keyOrMap;
    } else if (arguments.length > 1) {
        attrs = {[keyOrMap]: value};
    }

    // Store transitioned attributes values
    // until transition ends.
    var store = '__transitionAttrs__';
    var id = utils.generateHash(JSON.stringify(keyOrMap));
    this.each(function () {
        var newAttrs = {};
        for (var key in attrs) {
            if (typeof attrs[key] === 'function') {
                newAttrs[key] = attrs[key].apply(this, arguments);
            } else {
                newAttrs[key] = attrs[key];
            }
        }
        this[store] = _.extend(
            this[store] || {},
            newAttrs
        );
    });
    var onTransitionEnd = function () {
        var leftAttrs = {};
        var keys = Object.keys(attrs);
        if (this[store]) {
            Object.keys(this[store])
                .filter((k) => keys.indexOf(k) < 0)
                .forEach((k) => leftAttrs[k] = this[store][k]);
        }
        if (Object.keys(leftAttrs).length === 0) {
            delete this[store];
        } else {
            this[store] = leftAttrs;
        }
    };
    this.each(`interrupt.${id}`, onTransitionEnd);
    this.each(`end.${id}`, onTransitionEnd);

    return d3.transition.prototype.attr.apply(this, arguments);
};

var d3_add_transition_end_listener = (selection, callback) => {
    if (!d3.transition.prototype.isPrototypeOf(selection) || selection.empty()) {
        // If selection is not transition or empty,
        // execute callback immediately.
        callback.call(null, selection);
        return;
    }
    var t = selection.size();
    var onTransitionEnd = () => {
        t--;
        if (t === 0) {
            callback.call(null, selection);
        }
    };
    selection.each('interrupt.d3_on_transition_end', onTransitionEnd);
    selection.each('end.d3_on_transition_end', onTransitionEnd);
    return selection;
};

var d3_animationInterceptor = (speed, initAttrs, doneAttrs, afterUpdate) => {

    const xAfterUpdate = afterUpdate || _.identity;
    const afterUpdateIterator = function () {
        xAfterUpdate(this);
    };

    return function () {

        var flow = this;

        if (initAttrs) {
            flow = flow.attr(_.defaults(initAttrs, doneAttrs));
        }

        flow = d3_transition(flow, speed);

        flow = flow.attr(doneAttrs);

        if (speed > 0) {
            flow.each('end.d3_animationInterceptor', afterUpdateIterator);
        } else {
            flow.each(afterUpdateIterator);
        }

        return flow;
    };
};

var d3_selectAllImmediate = (container, selector) => {
    var node = container.node();
    return container.selectAll(selector).filter(function () {
        return this.parentNode === node;
    });
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
    d3_selectAllImmediate,
    wrapText,
    cutText
};