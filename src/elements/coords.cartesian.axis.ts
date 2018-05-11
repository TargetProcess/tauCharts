import {defaults, take, normalizeAngle} from '../utils/utils';
import {selectOrAppend, classes} from '../utils/utils-dom';
import {cutText, wrapText, avoidTickTextCollision} from '../utils/d3-decorators';
import {CSS_PREFIX} from '../const';
import * as utilsDraw from '../utils/utils-draw';
import {Selection} from 'd3-selection';
import {Transition} from 'd3-transition';

import {AxisLabelGuide, ScaleFunction, ScaleGuide} from '../definitions';

type AxisOrient = 'top' | 'right' | 'bottom' | 'left';
type GridOrient = 'horizontal' | 'vertical';

interface AxisConfig {
    scale: ScaleFunction;
    scaleGuide: ScaleGuide;
    ticksCount?: number;
    tickFormat?: (x) => string;
    tickSize?: number;
    tickPadding?: number;
    gridOnly?: boolean;
    position: [number, number];
}

interface GridConfig {
    scale: ScaleFunction;
    scaleGuide: ScaleGuide;
    ticksCount: number;
    tickSize: number;
    position: [number, number];
}

type d3Selection = Selection<any, any, any, any>;
type d3Transition = Transition<any, any, any, any>;

function identity<T>(x: T) {
    return x;
}

const epsilon = 1e-6;

function translateX(x: number) {
    return `translate(${x + 0.5},0)`;
}

function translateY(y: number) {
    return `translate(0,${y + 0.5})`;
}

function center(scale: ScaleFunction) {
    var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
    if (scale.round()) {
        offset = Math.round(offset);
    }
    return function (d) {
        return (scale(d) + offset);
    };
}

function getContainer(selection: d3Selection) {
    let svg: SVGElement = selection.node();

    while (svg && svg.tagName !== 'svg') {
        svg = svg.parentNode as SVGElement;
    }

    return svg;
}

const Orient = {
    'top': 1,
    'right': 2,
    'bottom': 3,
    'left': 4
};

function createAxis(config: AxisConfig) {

    const orient = Orient[config.scaleGuide.scaleOrient];
    const scale = config.scale;
    const scaleGuide = config.scaleGuide;
    const labelGuide = scaleGuide.label;
    const {
        ticksCount,
        tickFormat,
        tickSize,
        tickPadding,
        gridOnly
    } = defaults(config, {
            tickSize: 6,
            tickPadding: 3,
            gridOnly: false
        });

    const isLinearScale = (scale.scaleType === 'linear');
    const isOrdinalScale = (scale.scaleType === 'ordinal' || scale.scaleType === 'period');
    const isHorizontal = (orient === Orient.top || orient === Orient.bottom);
    const ko = (orient === Orient.top || orient === Orient.left ? -1 : 1);
    const x = (isHorizontal ? 'x' : 'y');
    const y = (isHorizontal ? 'y' : 'x');
    const transform = (isHorizontal ? translateX : translateY);
    const kh = (isHorizontal ? 1 : -1);

    return ((context: d3Selection | d3Transition) => {

        var values: any[];
        if (scale.ticks) {
            values = scale.ticks(ticksCount);
            // Prevent generating too much ticks
            let count = Math.floor(ticksCount * 1.25);
            while ((values.length > count) && (count > 2) && (values.length > 2)) {
                values = scale.ticks(--count);
            }
        } else {
            values = scale.domain();
        }
        if (scaleGuide.hideTicks) {
            values = gridOnly ? values.filter((d => d == 0)) : [];
        }

        const format = (tickFormat == null ? (scale.tickFormat ? scale.tickFormat(ticksCount) : identity) : tickFormat);
        const spacing = (Math.max(tickSize, 0) + tickPadding);
        const range = scale.range();
        const range0 = (range[0] + 0.5);
        const range1 = (range[range.length - 1] + 0.5);
        let position = (scale.bandwidth ? center : identity)(scale);
        if (scaleGuide.facetAxis) {
            let oldPos = position;
            position = (d) => oldPos(d) - scale.stepSize(d) / 2;
        }
        // Todo: Determine if scale copy is necessary. Fails on ordinal scales with ratio.
        // const position = (scale.bandwidth ? center : identity)(scale.copy());

        const transition = ((context as d3Transition).selection ? (context as d3Transition) : null);
        const selection = (transition ? transition.selection() : context as d3Selection);
        const containerSize = getContainer(selection).getBoundingClientRect();

        // Set default style
        selection
            .attr('fill', 'none')
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', orient === Orient.right ? 'start' : orient === Orient.left ? 'end' : 'middle');

        interface TickDataBinding {
            tickExit: d3Selection;
            tickEnter: d3Selection;
            tick: d3Selection;
        }

        function drawDomain() {
            const domainLineData = scaleGuide.hideTicks || scaleGuide.hide ? [] : [null];
            take(selection.selectAll('.domain').data(domainLineData))
                .then((path) => {
                    if (transition) {
                        path.exit()
                            .transition(transition)
                            .attr('opacity', 0)
                            .remove();
                    }
                    return path.merge(
                        path.enter().insert('path', '.tick')
                            .attr('class', 'domain')
                            .attr('opacity', 1)
                            .attr('stroke', '#000'));
                })
                .then((path) => {
                    return (transition ?
                        path.transition(transition) :
                        path);
                })
                .then((path) => {
                    path.attr('d', orient === Orient.left || orient == Orient.right ?
                        `M${ko * tickSize},${range0}H0.5V${range1}H${ko * tickSize}` :
                        `M${range0},${ko * tickSize}V0.5H${range1}V${ko * tickSize}`);
                });
        }

        function createTicks(): TickDataBinding {
            return take((selection
                .selectAll('.tick') as d3Selection)
                .data(values, (x) => String(scale(x)))
                .order())

                .then((tick) => {
                    const tickExit = tick.exit<any>();
                    const tickEnter = tick.enter().append('g').attr('class', 'tick');

                    return {
                        tickExit,
                        tickEnter,
                        tick: tick.merge(tickEnter)
                    };
                })
                .then((result) => {
                    if (isLinearScale) {
                        const ticks = scale.ticks();
                        const domain = scale.domain();
                        const last = (values.length - 1);
                        const shouldHighlightZero = (
                            (ticks.length > 1) &&
                            (domain[0] * domain[1] < 0) &&
                            (-domain[0] > (ticks[1] - ticks[0]) / 2) &&
                            (domain[1] > (ticks[last] - ticks[last - 1]) / 2)
                        );
                        result.tick
                            .classed('zero-tick', (d) => {
                                return (
                                    (d == 0) &&
                                    shouldHighlightZero
                                );
                            });
                    }
                    return result;
                })
                .result();
        }

        function updateTicks(ticks: TickDataBinding) {

            take(ticks)

                .then(({tickEnter, tickExit, tick}) => {

                    if (!transition) {
                        return {tick, tickExit};
                    }

                    tickEnter
                        .attr('opacity', epsilon)
                        .attr('transform', function (d) {
                            const p: number = position(d);
                            return transform(p);
                        });

                    return {
                        tick: tick.transition(transition),
                        tickExit: tickExit.transition(transition)
                            .attr('opacity', epsilon)
                            .attr('transform', function (d) {
                                const p = position(d);
                                if (isFinite(p)) {
                                    return transform(p);
                                }
                                return (this as SVGElement).getAttribute('transform');
                            })
                    };

                })

                .then(({tick, tickExit}) => {

                    tickExit.remove();

                    tick
                        .attr('opacity', 1)
                        .attr('transform', (d) => transform(position(d)));

                });
        }

        function drawLines(ticks: TickDataBinding) {
            const ly = (ko * tickSize);
            const lx = (isOrdinalScale ? ((d) => (kh * scale.stepSize(d) / 2)) : null);

            take(ticks)
                .then(({tick, tickEnter}) => {
                    const line = tick.select('line');
                    const lineEnter = tickEnter.append('line')
                        .attr('stroke', '#000')
                        .attr(`${y}2`, ly);

                    if (isOrdinalScale) {
                        lineEnter
                            .attr(`${x}1`, lx)
                            .attr(`${x}2`, lx);
                    }

                    return line.merge(lineEnter);
                })
                .then((line) => {
                    if (transition) {
                        return line.transition(transition);
                    }
                    return line;
                })
                .then((line) => {
                    line
                        .attr(`${y}2`, ly);

                    if (isOrdinalScale) {
                        line
                            .attr(`${x}1`, lx)
                            .attr(`${x}2`, lx);
                    }
                });
        }

        function drawExtraOrdinalLine() {
            if (!isOrdinalScale || !values || !values.length) {
                return;
            }

            take(selection.selectAll('.extra-tick-line').data([null]))
                .then((extra) => {
                    return extra.merge(
                        extra.enter().insert('line', '.tick')
                            .attr('class', 'extra-tick-line')
                            .attr('stroke', '#000'));
                })
                .then((extra) => {
                    return (transition ?
                        extra.transition(transition) :
                        extra);
                })
                .then((extra) => {
                    extra
                        .attr(`${x}1`, range0)
                        .attr(`${x}2`, range0)
                        .attr(`${y}1`, 0)
                        .attr(`${y}2`, ko * tickSize);
                });
        }

        function drawText(ticks: TickDataBinding) {
            const textAnchor = scaleGuide.textAnchor;
            const ty = (ko * spacing);
            const tdy = (orient === Orient.top ? '0em' : orient === Orient.bottom ? '0.71em' : '0.32em');

            function fixTextPosForVerticalFacets(selection) {
                if (scaleGuide.facetAxis) {
                    return selection
                        .attr('dx', -config.position[0] + 18)
                        .attr('dy', 16);
                }
            }

            take(ticks)
                .then(({tick, tickEnter}) => {
                    const text = tick.select('text');
                    const textEnter = tickEnter.append('text')
                        .attr('fill', '#000')
                        .attr(y, ty)
                        .attr('dy', tdy);
                    rotateText(textEnter);
                    fixTextPosForVerticalFacets(textEnter);

                    return text.merge(textEnter);
                })
                .then((text) => {
                    text
                        .text(format)
                        .attr('text-anchor', textAnchor);

                    if (isHorizontal === false && scaleGuide.facetAxis === true) {
                        const facetShift = utilsDraw
                            .parseTransformTranslate(selection.node().parentNode.getAttribute('transform'));

                        fixLongText(text, containerSize.width - Math.abs(facetShift.x));
                    } else {
                        fixLongText(text);
                    }

                    if (isHorizontal && (scale.scaleType === 'time')) {
                        fixHorizontalTextOverflow(text);
                    }
                    if (isHorizontal && (scale.scaleType === 'time' || scale.scaleType === 'linear')) {
                        fixOuterTicksOverflow(text);
                    }

                    return text;
                })
                .then((text) => {
                    if (transition) {
                        return text.transition(transition);
                    }
                    return text;
                })
                .then((text) => {
                    text
                        .attr(y, ty);

                    rotateText(text);
                    fixTextPosForVerticalFacets(text);

                    if (isOrdinalScale && scaleGuide.avoidCollisions) {
                        if (transition) {
                            transition.on('end.fixTickTextCollision', () => fixTickTextCollision(ticks.tick));
                        } else {
                            fixTickTextCollision(ticks.tick);
                        }
                    }
                });
        }

        function rotateText(text: d3Selection | d3Transition) {
            const angle = normalizeAngle(scaleGuide.rotate);

            // Todo: Rotate around rotation point (text anchor?)
            text
                .attr('transform', utilsDraw.rotate(angle));

            // Todo: Unpredictable behavior, need review
            if ((Math.abs(angle / 90) % 2) > 0) {
                let kRot = (angle < 180 ? 1 : -1);
                let k = isHorizontal ? 0.5 : -2;
                let sign = (orient === Orient.top || orient === Orient.left ? -1 : 1);
                let dy = (k * (orient === Orient.top || orient === Orient.bottom ?
                    (sign < 0 ? 0 : 0.71) :
                    0.32));

                text
                    .attr('x', 9 * kRot)
                    .attr('y', 0)
                    .attr('dx', isHorizontal ? null : `${dy}em`)
                    .attr('dy', `${dy}em`);
            }
        }

        function fixLongText(text: d3Selection, containerWidth = 0) {
            const stepSize = (d) => Math.max(scale.stepSize(d), scaleGuide.tickFormatWordWrapLimit, containerWidth);

            if (scaleGuide.tickFormatWordWrap) {
                wrapText(
                    text,
                    stepSize,
                    scaleGuide.tickFormatWordWrapLines,
                    scaleGuide.tickFontHeight,
                    !isHorizontal
                );
            } else {
                cutText(
                    text,
                    stepSize
                );
            }
        }

        function fixHorizontalTextOverflow(text: d3Selection) {
            if (values.length < 2) {
                return;
            }
            var maxTextLn = 0;
            var iMaxTexts = -1;
            const nodes: Element[] = text.nodes();
            nodes.forEach((textNode, i) => {
                const textContent = (textNode.textContent || '');
                var textLength = textContent.length;
                if (textLength > maxTextLn) {
                    maxTextLn = textLength;
                    iMaxTexts = i;
                }
            });

            const tickStep = (position(values[1]) - position(values[0]));

            var hasOverflow = false;
            if (iMaxTexts >= 0) {
                var rect = nodes[iMaxTexts].getBoundingClientRect();
                hasOverflow = (tickStep - rect.width) < 8; // 2px from each side
            }
            selection.classed(`${CSS_PREFIX}time-axis-overflow`, hasOverflow);
        }

        function fixOuterTicksOverflow(text: d3Selection) {
            if (values.length === 0) {
                return;
            }

            const value0 = values[0];
            const value1 = values[values.length - 1];

            const tempLeft = selection
                .append('line')
                .attr('x1', position(value0))
                .attr('x2', position(value0))
                .attr('y1', 0)
                .attr('y2', 1) as d3Selection;
            const tempRight = selection
                .append('line')
                .attr('x1', position(value1))
                .attr('x2', position(value1))
                .attr('y1', 0)
                .attr('y2', 1) as d3Selection;
            const available = {
                left: (tempLeft.node().getBoundingClientRect().left - containerSize.left),
                right: (containerSize.right - tempRight.node().getBoundingClientRect().right)
            };
            tempLeft.remove();
            tempRight.remove();

            const fixText = (node: SVGElement, dir: -1 | 1, value) => {
                const rect = node.getBoundingClientRect();
                const side = (dir > 0 ? 'right' : 'left');
                const tx = position(value);
                const limit = available[side];
                const diff = Math.ceil(rect.width / 2 - limit + 1); // 1px rounding fix
                node.setAttribute('dx', String(diff > 0 ? -dir * diff : 0));
            };
            const tick0 = text.filter((d) => d === value0).node();
            const tick1 = text.filter((d) => d === value1).node();
            text.attr('dx', null);
            fixText(tick0, -1, value0);
            fixText(tick1, 1, value1);
        }

        function fixTickTextCollision(tick: d3Selection) {
            avoidTickTextCollision(tick, isHorizontal);
        }

        function drawAxisLabel() {
            const guide = labelGuide;

            const labelTextNode = selectOrAppend(selection, `text.label`)
                .attr('class', classes('label', guide.cssClass))
                .attr('transform', utilsDraw.rotate(guide.rotate))
                .attr('text-anchor', guide.textAnchor);

            take(labelTextNode)
                .then((label) => {
                    if (transition) {
                        return label.transition(transition);
                    }
                    return label;
                })
                .then((label) => {

                    const ly = (kh * guide.padding);
                    const size = Math.abs(range1 - range0);
                    const lx = isHorizontal ? size : 0;

                    label
                        .attr('x', lx)
                        .attr('y', ly)
                        .attr('text-anchor', 'end');
                });

            const delimiter = ' \u2192 ';
            const textParts = guide.text.split(delimiter);
            for (var i = textParts.length - 1; i > 0; i--) {
                textParts.splice(i, 0, delimiter);
            }

            const tspans = labelTextNode.selectAll('tspan')
                .data(textParts)
                .enter()
                .append('tspan')
                .attr('class', (d, i) => i % 2 ?
                    (`label-token-delimiter label-token-delimiter-${i}`) :
                    (`label-token label-token-${i}`))
                .text((d) => d)
                .exit()
                .remove();
        }

        if (!gridOnly) {
            drawDomain();
        }
        const ticks = createTicks();
        updateTicks(ticks);
        if (!scaleGuide.facetAxis) {
            drawLines(ticks);
        }
        if (isOrdinalScale && gridOnly) { // Todo: Explicitly determine if grid 
            drawExtraOrdinalLine();
        }
        if (!gridOnly) {
            drawText(ticks);
            if (!labelGuide.hide) {
                drawAxisLabel();
            }
        }

    });
}

export function cartesianAxis(config: AxisConfig) {
    return createAxis(config);
}

export function cartesianGrid(config: GridConfig) {
    return createAxis({
        scale: config.scale,
        scaleGuide: config.scaleGuide,
        ticksCount: config.ticksCount,
        tickSize: config.tickSize,
        gridOnly: true,
        position: config.position,
    });
}
