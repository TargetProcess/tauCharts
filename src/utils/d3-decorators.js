import * as utils from './utils';
import * as utilsDom from './utils-dom';
import * as utilsDraw from './utils-draw';
import * as d3 from 'd3';
import * as axis from '../elements/coords.cartesian.axis';
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

export function avoidTickTextCollision(ticks, isHorizontal) {

    const textOffsetStep = 11;
    const refOffsetStart = isHorizontal ? -10 : 20;
    const translateParam = isHorizontal ? 0 : 1;
    const directionKoeff = isHorizontal ? 1 : -1;
    var layoutModel = [];
    ticks
        .each(function () {
            var tick = d3.select(this);

            var translateXStr = tick
                .attr('transform')
                .replace('translate(', '')
                .replace(' ', ',') // IE specific
                .split(',')
            [translateParam];

            var translateX = directionKoeff * parseFloat(translateXStr);
            var tNode = tick.select('text');

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
                .call(d3_setAttrs(attrs));
        } else {
            curr.tickRef.selectAll('line.label-ref').remove();
        }

        return curr;
    });
}

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
    d3_createPathTween,
    d3_selectAllImmediate,
    d3_setAttrs,
    d3_setClasses,
    d3_transition,
    wrapText,
    cutText
};