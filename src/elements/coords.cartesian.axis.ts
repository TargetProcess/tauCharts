interface Axis {
    (context): void;

    scale(): AxisScale;
    scale(scale: AxisScale): Axis;
    ticks(): any;
    ticks(ticks): Axis;
    tickFormat(): any;
    tickFormat(format): Axis;
    tickSize(): any;
    tickSize(tickSize): Axis;
}

interface AxisScale {
    (x: any): number | undefined;
    domain(): any[];
    range(): number[];
    copy(): this;
    bandwidth?(): number;
    ticks?(...args: any[]): any;
    tickFormat?(...args: any[]): any;
}

const identity = (<T>(x: T) => x);

const epsilon = 1e-6;

function translateX(x: number) {
    return `translate(${x + 0.5},0)`;
}

function translateY(y: number) {
    return `translate(0,${y + 0.5})`;;
}

function center(scale) {
    var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
    if (scale.round()) {
        offset = Math.round(offset)
    };
    return function (d) {
        return (scale(d) + offset);
    };
}

const axisStoreProp = '__axis';

const Orient: {[orient: string]: number} = {
    'top': 1,
    'right': 2,
    'bottom': 3,
    'left': 4
};

function entering(this: SVGElement) {
    return !this[axisStoreProp];
}

function createAxis(orient: number, scale?: AxisScale) {
    var tickArguments = [];
    var tickValues = null;
    var tickFormat = null;
    var tickSizeInner = 6;
    var tickSizeOuter = 6;
    var tickPadding = 3;
    var k = (orient === Orient.top || orient === Orient.left ? -1 : 1);
    var x = (orient === Orient.left || orient === Orient.right ? 'x' : 'y');
    var transform = (orient === Orient.top || orient === Orient.bottom ? translateX : translateY);

    const axis: Axis = ((context) => {
        var values = tickValues == null ? (scale.ticks ? scale.ticks(...tickArguments) : scale.domain()) : tickValues;
        var format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat(...tickArguments) : identity) : tickFormat;
        var spacing = Math.max(tickSizeInner, 0) + tickPadding;
        var range = scale.range();
        var range0 = range[0] + 0.5;
        var range1 = range[range.length - 1] + 0.5;
        var position = (scale.bandwidth ? center : identity)(scale.copy());
        var selection = context.selection ? context.selection() : context;
        var path = selection.selectAll('.domain').data([null]);
        var tick = selection.selectAll('.tick').data(values, scale).order();
        var tickExit = tick.exit();
        var tickEnter = tick.enter().append('g').attr('class', 'tick');
        var line = tick.select('line');
        var text = tick.select('text');

        path = path.merge(path.enter().insert('path', '.tick')
            .attr('class', 'domain')
            .attr('stroke', '#000'));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append('line')
            .attr('stroke', '#000')
            .attr(x + '2', k * tickSizeInner));

        text = text.merge(tickEnter.append('text')
            .attr('fill', '#000')
            .attr(x, k * spacing)
            .attr('dy', orient === Orient.top ? '0em' : orient === Orient.bottom ? '0.71em' : '0.32em'));

        if (context !== selection) {
            path = path.transition(context);
            tick = tick.transition(context);
            line = line.transition(context);
            text = text.transition(context);

            tickExit = tickExit.transition(context)
                .attr('opacity', epsilon)
                .attr('transform', function (d) {
                    return isFinite(d = position(d)) ? transform(d) : this.getAttribute('transform');
                });

            tickEnter
                .attr('opacity', epsilon)
                .attr('transform', function (d) {
                    var p = this.parentNode[axisStoreProp];
                    return transform(p && isFinite(p = p(d)) ? p : position(d));
                });
        }

        tickExit.remove();

        path
            .attr('d', orient === Orient.left || orient == Orient.right
                ? `M${k * tickSizeOuter},${range0}H0.5V${range1}H${k * tickSizeOuter}`
                : `M${range0},${k * tickSizeOuter}V0.5H${range1}V${k * tickSizeOuter}`);

        tick
            .attr('opacity', 1)
            .attr('transform', function (d) { return transform(position(d)); });

        line
            .attr(`${x}2`, k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr('fill', 'none')
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', orient === Orient.right ? 'start' : orient === Orient.left ? 'end' : 'middle');

        selection
            .each(function () {
                this[axisStoreProp] = position;
            });

    }) as Axis;

    axis.scale = function (s?: AxisScale): any {
        if (arguments.length) {
            scale = s;
            return axis;
        }
        return scale;
    };

    axis.ticks = function () {
        tickArguments = Array.from(arguments)
        return axis;
    };

    // axis.tickArguments = function (_?) {
    //     return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
    // };

    // axis.tickValues = function (_) {
    //     return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
    // };

    axis.tickFormat = function (format?) {
        if (arguments.length) {
            tickFormat = format;
            return axis;
        }
        return tickFormat;
    };

    axis.tickSize = function (size?): any {
        if (arguments.length) {
            tickSizeInner = tickSizeOuter = Number(size);
            return axis;
        }
        return tickSizeInner;
    };

    // axis.tickSizeInner = function (_) {
    //     return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    // };

    // axis.tickSizeOuter = function (_) {
    //     return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    // };

    // axis.tickPadding = function (_) {
    //     return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    // };

    return axis;
}

export function cartesianAxis(orient, scale) {
    return createAxis(Orient[orient], scale);
}
