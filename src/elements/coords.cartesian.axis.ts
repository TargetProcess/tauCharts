import {defaults, take} from '../utils/utils';
import * as d3 from 'd3';

type AxisOrient = 'top' | 'right' | 'bottom' | 'left';
type GridOrient = 'horizontal' | 'vertical';

interface AxisConfig {
    orient: AxisOrient;
    scale: AxisScale;
    tickArguments: any[];
    tickFormat?: (x) => string;
    tickSize?: number;
    tickPadding?: number;
    hideText?: boolean;
}

interface GridConfig {
    orient: GridOrient;
    scale: AxisScale;
    tickArguments: any[];
    tickSize: number;
}

type d3Selection = d3.Selection<any, any, any, any>;
type d3Transition = d3.Transition<any, any, any, any>;

interface AxisScale {
    (x: any): number | undefined;
    domain(): any[];
    range(): number[];
    copy(): AxisScale;
    bandwidth?(): number;
    round?(): number;
    ticks?(...args: any[]): any[];
    tickFormat?(...args: any[]): (x) => string;
}

function identity<T>(x: T) {
    return x;
}

const epsilon = 1e-6;

function translateX(x: number) {
    return `translate(${x + 0.5},0)`;
}

function translateY(y: number) {
    return `translate(0,${y + 0.5})`;;
}

function center(scale: AxisScale) {
    var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
    if (scale.round()) {
        offset = Math.round(offset)
    };
    return function (d) {
        return (scale(d) + offset);
    };
}

const axisPositionStore = '__axis';

const Orient: {[orient: string]: number} = {
    'top': 1,
    'right': 2,
    'bottom': 3,
    'left': 4
};

function createAxis(config: AxisConfig) {
    const orient = Orient[config.orient];
    const scale = config.scale;
    const {
        tickArguments,
        tickFormat,
        tickSize,
        tickPadding,
        hideText
    } = defaults(config, {
            tickArguments: [],
            tickFormat: null as any[],
            tickSize: 6,
            tickPadding: 3,
            hideText: false
        });
    const k = (orient === Orient.top || orient === Orient.left ? -1 : 1);
    const x = (orient === Orient.left || orient === Orient.right ? 'x' : 'y');
    const transform = (orient === Orient.top || orient === Orient.bottom ? translateX : translateY);

    return ((context: d3Selection | d3Transition) => {

        const values = (scale.ticks ? scale.ticks(...tickArguments) : scale.domain());
        const format = (tickFormat == null ? (scale.tickFormat ? scale.tickFormat(...tickArguments) : identity) : tickFormat);
        const spacing = (Math.max(tickSize, 0) + tickPadding);
        const range = scale.range();
        const range0 = (range[0] + 0.5);
        const range1 = (range[range.length - 1] + 0.5);
        const position = (scale.bandwidth ? center : identity)(scale.copy());

        const transition = ((context as d3Transition).selection ? (context as d3Transition) : null);
        const selection = (transition ? transition.selection() : context as d3Selection);

        // Set default style
        selection
            .each(function () {
                // Note: In case of transition interrupt use old scale.
                this[axisPositionStore] = position;
            })
            .attr('fill', 'none')
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', orient === Orient.right ? 'start' : orient === Orient.left ? 'end' : 'middle');

        // Draw domain line
        take(selection.selectAll('.domain').data([null]))
            .next((path) => {
                return path.merge(
                    path.enter().insert('path', '.tick')
                        .attr('class', 'domain')
                        .attr('stroke', '#000'));
            })
            .next((path) => {
                return (transition ?
                    path.transition(transition) :
                    path);
            })
            .next((path) => {
                path.attr('d', orient === Orient.left || orient == Orient.right ?
                    `M${k * tickSize},${range0}H0.5V${range1}H${k * tickSize}` :
                    `M${range0},${k * tickSize}V0.5H${range1}V${k * tickSize}`);
            });

        // Draw ticks
        take((selection
            .selectAll('.tick') as d3Selection)
            .data(values, (x) => String(scale(x)))
            .order())

            .next((tick) => {
                const tickExit = tick.exit<any>();
                const tickEnter = tick.enter().append('g').attr('class', 'tick');

                return {
                    tickExit,
                    tickEnter,
                    tick: tick.merge(tickEnter)
                };
            })

            .branch([

                // Tick group
                (branch) => branch

                    .next(({tickEnter, tickExit, tick}) => {

                        if (!transition) {
                            return {tick, tickExit};
                        }

                        tickEnter
                            .attr('opacity', epsilon)
                            .attr('transform', function (d) {
                                const prevPosition: AxisScale = (this as SVGElement).parentNode[axisPositionStore];
                                var p: number;
                                if (prevPosition) {
                                    p = prevPosition(d);
                                }
                                if (!prevPosition || !isFinite(p)) {
                                    p = position(d);
                                }
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

                    .next(({tick, tickExit}) => {

                        tickExit.remove();

                        tick
                            .attr('opacity', 1)
                            .attr('transform', (d) => transform(position(d)));

                    }),

                // Draw tick lines
                (branch) => branch
                    .next(({tick, tickEnter}) => {
                        const line = tick.select('line');
                        const lineEnter = tickEnter.append('line')
                            .attr('stroke', '#000')
                            .attr(x + '2', k * tickSize);

                        return line.merge(lineEnter);
                    })
                    .next((line) => {
                        if (transition) {
                            return line.transition(transition);
                        }
                        return line;
                    })
                    .next((line) => {
                        line
                            .attr(`${x}2`, k * tickSize);
                    }),

                // Draw tick text
                (hideText ? null : (branch) => branch
                    .next(({ tick, tickEnter }) => {
                        const text = tick.select('text');
                        const textEnter = tickEnter.append('text')
                            .attr('fill', '#000')
                            .attr(x, k * spacing)
                            .attr('dy', orient === Orient.top ? '0em' : orient === Orient.bottom ? '0.71em' : '0.32em');

                        return text.merge(textEnter);
                    })
                    .next((text) => {
                        if (transition) {
                            return text.transition(transition);
                        }
                        return text;
                    })
                    .next((text) => {
                        text
                            .attr(x, k * spacing)
                            .text(format);
                    }))
            ]);

    });
}

export function cartesianAxis(config: AxisConfig) {
    return createAxis(config);
}

export function cartesianGrid(config: GridConfig) {
    return createAxis({
        scale: config.scale,
        orient: (config.orient === 'horizontal' ? 'left' : 'bottom'),
        tickArguments: config.tickArguments,
        tickSize: config.tickSize,
        hideText: true
    });
}
