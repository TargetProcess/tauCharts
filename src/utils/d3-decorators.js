import {utils} from './utils';
import {utilsDom} from './utils-dom';
import {utilsDraw} from './utils-draw';
import d3 from 'd3';
import interpolatePathPoints from './path/interpolators/path-points';
import {getLineInterpolator, getInterpolatorSplineType} from './path/interpolators/interpolators-registry';

var d3getComputedTextLength = () => utils.memoize(
    (d3Text) => d3Text.node().getComputedTextLength(),
    (d3Text) => d3Text.node().textContent.length);

var cutText = (textString, getScaleStepSize, getComputedTextLength) => {

    getComputedTextLength = getComputedTextLength || d3getComputedTextLength();

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

    getComputedTextLength = getComputedTextLength || d3getComputedTextLength();

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

                var tickNode = d3.select(this);

                var setAttr = function (selection) {
                    var tickCoord = logicalScale(tickData);
                    var tx = isHorizontal ? tickCoord : 0;
                    var ty = isHorizontal ? 0 : tickCoord;
                    selection.attr('transform', `translate(${tx},${ty})`);

                    var offset = logicalScale.stepSize(tickData) * 0.5;
                    var key = (isHorizontal) ? 'x' : 'y';
                    var val = (isHorizontal) ? offset : (-offset);
                    selection
                        .select('line')
                        .attr(key + '1', val).attr(key + '2', val);
                };

                if (!tickNode.classed('tau-enter')) {
                    tickNode.call(setAttr);
                    tickNode.classed('tau-enter', true);
                }

                d3_transition(tickNode, animationSpeed).call(setAttr);
            }
        });
};

var d3_decorator_fixHorizontalAxisTicksOverflow = function (axisNode, activeTicks) {

    var isDate = activeTicks.length && activeTicks[0] instanceof Date;
    if (isDate) {
        activeTicks = activeTicks.map(d => Number(d));
    }

    var timeTicks = axisNode.selectAll('.tick')
        .filter(d => activeTicks.indexOf(isDate ? Number(d) : d) >= 0)
        .nodes();
    if (timeTicks.length < 2) {
        return;
    }

    var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace('translate(', ''));
    var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace('translate(', ''));

    var tickStep = tick1 - tick0;

    var maxTextLn = 0;
    var iMaxTexts = -1;
    var timeTexts = axisNode.selectAll('.tick text')
        .filter(d => activeTicks.indexOf(isDate ? Number(d) : d) >= 0)
        .nodes();
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

var d3_decorator_fixEdgeAxisTicksOverflow = function (axisNode, activeTicks) {

    activeTicks = activeTicks.map(d => Number(d));
    var texts = axisNode
        .selectAll('.tick text')
        .filter(d => activeTicks.indexOf(Number(d)) >= 0)
        .nodes();
    if (texts.length === 0) {
        return;
    }

    var svg = axisNode.node();
    while (svg.tagName !== 'svg') {
        svg = svg.parentNode;
    }
    var svgRect = svg.getBoundingClientRect();

    texts.forEach((n) => {
        var t = d3.select(n);
        t.attr('dx', 0);
    });

    var fixText = (node, dir) => {
        var d3Node = d3.select(node);
        var rect = node.getBoundingClientRect();
        var side = (dir > 0 ? 'right' : 'left');
        var diff = dir * (rect[side] - svgRect[side]);
        d3Node.attr('dx', (diff > 0 ? -dir * diff : 0));
    };
    fixText(texts[0], -1);
    fixText(texts[texts.length - 1], 1);
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
    var extraTick = utilsDom.selectOrAppend(axisNode, `g.${tickClass}`);
    var extraLine = utilsDom.selectOrAppend(extraTick, 'line');
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
    var labelTextNode = utilsDom.selectOrAppend(axisNode, `text.label`)
        .attr('class', utilsDom.classes('label', guide.cssClass))
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

var d3_decorator_wrap_tick_label = function (
    nodeScale,
    animationSpeed,
    guide,
    isHorizontal,
    logicalScale
) {

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

        let texts = nodeScale.selectAll('.tick text');
        let attrs = {
            x: 9 * kRot,
            y: 0,
            dx: (isHorizontal) ? null : `${dy}em`,
            dy: `${dy}em`
        };

        // NOTE: Override d3 axis transition.
        texts.transition();
        texts.attr(attrs);
        d3_transition(texts, animationSpeed, 'axisTransition').attr(attrs);
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
        tick.call(cutText, limitFunc, d3getComputedTextLength());
    }
};

var d3_decorator_avoidLabelsCollisions = function (nodeScale, isHorizontal, activeTicks) {
    var isDate = activeTicks.length && activeTicks[0] instanceof Date;
    if (isDate) {
        activeTicks = activeTicks.map(d => Number(d));
    }
    const textOffsetStep = 11;
    const refOffsetStart = isHorizontal ? -10 : 20;
    const translateParam = isHorizontal ? 0 : 1;
    const directionKoeff = isHorizontal ? 1 : -1;
    var layoutModel = [];
    nodeScale
        .selectAll('.tick')
        .filter(d => activeTicks.indexOf(isDate ? Number(d) : d) >= 0)
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

            var size = curr.textRef.size();
            var text = curr.textRef.text();

            if (size > 1) {
                text = text.replace(/([\.]*$)/gi, '') + '...';
            }

            var dy = (curr.l * textOffsetStep); // -1 | 0 | +1
            var newY = parseFloat(curr.textRef.attr('y')) + dy;
            let tx = isHorizontal ? 0 : dy;
            let ty = isHorizontal ? dy : 0;
            var tr = (function (transform) {
                var rotate = 0;
                if (!transform) {
                    return rotate;
                }
                var rs = transform.indexOf('rotate(');
                if (rs >= 0) {
                    var re = transform.indexOf(')', rs + 7);
                    var rotateStr = transform.substring(rs + 7, re);
                    rotate = parseFloat(rotateStr.trim());
                }
                return rotate;
            })(curr.textRef.attr('transform'));

            curr.textRef
                .text((d, i) => i === 0 ? text : '')
                .attr('transform', 'translate(' + tx + ',' + ty + ') rotate(' + tr + ')');

            var attrs = {
                x1: 0,
                x2: 0,
                y1: newY + (isHorizontal ? -1 : 5),
                y2: refOffsetStart
            };

            if (!isHorizontal) {
                attrs.transform = 'rotate(-90)';
            }

            utilsDom.selectOrAppend(curr.tickRef, 'line.label-ref')
                .attr(attrs);
        } else {
            curr.tickRef.selectAll('line.label-ref').remove();
        }

        return curr;
    });
};

var d3_decorator_highlightZeroTick = (axisNode, scale) => {
    var ticks = scale.ticks();
    var domain = scale.domain();
    var last = (ticks.length - 1);
    var shouldHighlightZero = (
        (ticks.length > 1) &&
        (domain[0] * domain[1] < 0) &&
        (-domain[0] > (ticks[1] - ticks[0]) / 2) &&
        (domain[1] > (ticks[last] - ticks[last - 1]) / 2)
    );
    axisNode.selectAll('.tick')
        .classed('zero-tick', (d) => (
            d === 0 &&
            shouldHighlightZero
        ));
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

var d3_transition_attr = function (keyOrMap, value) {
    var d3AttrResult = d3.transition.prototype.attr.apply(this, arguments);

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
    var idStore = '__lastTransitions__';
    var id = getTransitionAttrId();
    this.each(function () {
        var newAttrs = {};
        for (var key in attrs) {
            if (typeof attrs[key] === 'function') {
                newAttrs[key] = attrs[key].apply(this, arguments);
            } else {
                newAttrs[key] = attrs[key];
            }
        }
        this[store] = Object.assign(
            this[store] || {},
            newAttrs
        );

        // NOTE: As far as d3 `interrupt` event is called asynchronously,
        // we have to store ID to prevent removing attribute value from store,
        // when new transition is applied for the same attribute.
        if (!this[store][idStore]) {
            Object.defineProperty(this[store], idStore, {value: {}});
        }
        Object.keys(newAttrs).forEach((key) => this[store][idStore][key] = id);
    });
    var onTransitionEnd = function () {
        if (this[store]) {
            Object.keys(attrs)
                .filter((k) => this[store][idStore][k] === id)
                .forEach((k) => delete this[store][k]);
            if (Object.keys(this[store]).length === 0) {
                delete this[store];
            }
        }
    };
    this.on(`interrupt.${id}`, () => this.each(onTransitionEnd));
    this.on(`end.${id}`, () => this.each(onTransitionEnd));

    return d3AttrResult;
};
var transitionsCounter = 0;
var getTransitionAttrId = function () {
    return ++transitionsCounter;
};

var d3_add_transition_end_listener = (selection, callback) => {
    if (!d3.transition.prototype.isPrototypeOf(selection) || selection.empty()) {
        // If selection is not transition or empty,
        // execute callback immediately.
        callback.call(null, selection);
        return;
    }
    var onTransitionEnd = () => callback.call(null, selection);
    selection.on('interrupt.d3_on_transition_end', onTransitionEnd);
    selection.on('end.d3_on_transition_end', onTransitionEnd);
    return selection;
};

var d3_animationInterceptor = (speed, initAttrs, doneAttrs, afterUpdate) => {

    const xAfterUpdate = afterUpdate || ((x) => x);
    const afterUpdateIterator = function () {
        xAfterUpdate(this);
    };

    return function (selection) {

        var flow = selection;

        if (initAttrs) {
            flow = flow.call(d3_setAttrs(utils.defaults(initAttrs, doneAttrs)));
        }

        flow = d3_transition(flow, speed);

        flow = flow.call(d3_setAttrs(doneAttrs));

        if (speed > 0) {
            flow.on('end.d3_animationInterceptor', () => flow.each(afterUpdateIterator));
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

var d3_createPathTween = (
    attr,
    pathStringBuilder,
    pointConvertors,
    idGetter,
    interpolationType = 'linear'
) => {
    const pointStore = '__pathPoints__';

    return function (data) {
        if (!this[pointStore]) {
            this[pointStore] = pointConvertors.map(() => []);
        }

        const frames = pointConvertors.map((convertor, i) => {
            const points = utils.unique(data, idGetter).map(convertor);
            const interpolateLine = (
                getLineInterpolator(interpolationType) ||
                getLineInterpolator('linear')
            );
            const pointsTo = interpolateLine(points);
            const pointsFrom = this[pointStore][i];

            const interpolate = interpolatePathPoints(
                pointsFrom,
                pointsTo,
                getInterpolatorSplineType(interpolationType)
            );

            return {
                pointsFrom,
                pointsTo,
                interpolate
            };
        });

        return (t) => {
            if (t === 0) {
                let pointsFrom = frames.map((f) => f.pointsFrom);
                return pathStringBuilder(...pointsFrom);
            }
            if (t === 1) {
                let pointsTo = frames.map((f) => f.pointsTo);
                this[pointStore] = pointsTo;
                return pathStringBuilder(...pointsTo);
            }

            const intermediate = frames.map((f) => f.interpolate(t));

            // Save intermediate points to be able
            // to continue transition after interrupt
            this[pointStore] = intermediate;

            return pathStringBuilder(...intermediate);
        };
    };
};

var d3_axis = (orient) => {
    return ({
        'left': d3.axisLeft,
        'right': d3.axisRight,
        'top': d3.axisTop,
        'bottom': d3.axisBottom
    }[orient]);
};

var d3_setAttrs = (attrs) => {
    return (sel) => {
        Object.keys(attrs).forEach((k) => sel.attr(k, attrs[k]));
        return sel;
    };
};

var d3_setClasses = (classMap) => {
    return (sel) => {
        Object.keys(classMap).forEach((k) => sel.classed(k, classMap[k]));
        return sel;
    };
};

export {
    d3_animationInterceptor,
    d3_axis,
    d3_createPathTween,
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_start_line,
    d3_decorator_fixHorizontalAxisTicksOverflow,
    d3_decorator_fixEdgeAxisTicksOverflow,
    d3_decorator_highlightZeroTick,
    d3_decorator_prettify_categorical_axis_ticks,
    d3_decorator_avoidLabelsCollisions,
    d3_selectAllImmediate,
    d3_setAttrs,
    d3_setClasses,
    d3_transition,
    wrapText,
    cutText
};