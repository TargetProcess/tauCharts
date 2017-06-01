import {BaseScale} from './base';
import {TauChartError, errorCodes} from '../error';
import {DataFrame} from '../data-frame';
import * as d3 from 'd3';
import {
    ScaleConfig
} from '../definitions';

export class LogarithmicScale extends BaseScale {

    vars: number[];

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var domain = d3.extent(this.vars);

        var min = Number.isFinite(props.min) ? props.min : domain[0];
        var max = Number.isFinite(props.max) ? props.max : domain[1];

        domain = [
            Math.min(...[min, domain[0]].filter(Number.isFinite)),
            Math.max(...[max, domain[1]].filter(Number.isFinite))
        ];
        throwIfCrossesZero(domain);

        if (props.nice) {
            domain = niceLog10(domain) as [number, number];
        }

        this.vars = domain;

        this.addField('scaleType', 'logarithmic')
            .addField('discrete', false);
    }

    isInDomain(x) {
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!Number.isNaN(min) && !Number.isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval: [number, number]) {

        var domain = this.vars;
        throwIfCrossesZero(domain);

        var d3Scale = extendLogScale(d3.scaleLog())
            .domain(domain)
            .range(interval);
        d3Scale.stepSize = (() => 0);

        return this.toBaseScale(d3Scale, interval);
    }
}

function log10(x: number) {
    return Math.log(x) / Math.LN10;
}

function throwIfCrossesZero(domain: number[]) {
    if (domain[0] * domain[1] <= 0) {
        throw new TauChartError(
            'Logarithmic scale domain cannot cross zero.',
            errorCodes.INVALID_LOG_DOMAIN
        );
    }
}

function extendLogScale(scale) {
    var d3ScaleCopy = scale.copy;

    // NOTE: D3 log scale ticks count is not configurable
    // and returns 10 ticks per each exponent.
    // So here we make it return 10 ticks per each
    // step of 1, 2 or more exponents, according to
    // necessary ticks count.
    scale.ticks = function (n) {

        var ticksPerExp = 10;
        var ticks = [];
        var extent = d3.extent(scale.domain()) as [number, number];
        var lowExp = Math.floor(log10(extent[0]));
        var topExp = Math.ceil(log10(extent[1]));

        var step = Math.ceil(
            (topExp - lowExp) * ticksPerExp /
            (Math.ceil(n / ticksPerExp) * ticksPerExp)
        );

        for (let e = lowExp; e <= topExp; e += step) {
            for (let t = 1; t <= ticksPerExp; t++) {
                let tick = Math.pow(t, step) * Math.pow(10, e);
                tick = parseFloat(tick.toExponential(0));
                if (tick >= extent[0] && tick <= extent[1]) {
                    ticks.push(tick);
                }
            }
        }

        return ticks;
    };
    scale.copy = function () {
        var copy = d3ScaleCopy.call(scale);
        extendLogScale(copy);
        return copy;
    };

    return scale;
}

function niceLog10(domain: [number, number]): [number, number] {

    var isPositive = domain[0] > 0;
    var absDomain = domain.map((d) => Math.abs(d));
    var top = Math.max(...absDomain);
    var low = Math.min(...absDomain);

    var lowExp = low.toExponential().split('e');
    var topExp = top.toExponential().split('e');
    var niceLow = parseFloat(Math.floor(Number(lowExp[0])) + 'e' + lowExp[1]);
    var niceTop = parseFloat(Math.ceil(Number(topExp[0])) + 'e' + topExp[1]);

    return (
        isPositive ?
            [niceLow, niceTop] :
            [-niceTop, -niceLow]
    );
}
