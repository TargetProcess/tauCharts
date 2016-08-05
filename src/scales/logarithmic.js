import {BaseScale} from './base';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class LogarithmicScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var isNum = ((num) => (!isNaN(num) && _.isNumber(num)));

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars);

        var min = isNum(props.min) ? props.min : vars[0];
        var max = isNum(props.max) ? props.max : vars[1];

        vars = [
            Math.min(...[min, vars[0]].filter(isNum)),
            Math.max(...[max, vars[1]].filter(isNum))
        ];

        if (props.nice) {
            if (crossesZero(vars)) {
                vars = utils.niceZeroBased(vars);
            } else {
                vars = utils.niceLog10(vars);
            }
        }

        this.vars = vars;

        this.addField('scaleType', 'logarithmic')
            .addField('discrete', false);
    }

    isInDomain(x) {
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!isNaN(min) && !isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval) {

        var vars = this.vars;

        var d3Scale;

        if (crossesZero(vars)) {
            /*eslint-disable */
            console.warn(
                'Logarithmic scale domain cannot cross zero. Falling back to linear scale.'
            );/*eslint-enable */
            d3Scale = d3.scale.linear();
        } else {
            d3Scale = d3.scale.log();

            var extendLogScale = function (scale) {
                var d3ScaleCopy = scale.copy;

                // NOTE: D3 log scale ticks count is readonly
                // and returns 10 ticks per each exponent (10/e).
                // So here we filter them (10/2e, 10/3e ...).
                scale.ticks = function (n) {

                    var ticksPerExp = 10;
                    var ticks = [];
                    var extent = d3.extent(scale.domain());
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
                    return scale;
                };

                return scale;
            };
            extendLogScale(d3Scale);
        }

        d3Scale
            .domain(vars)
            .rangeRound(interval, 1);
        d3Scale.stepSize = (() => 0);

        return this.toBaseScale(d3Scale, interval);
    }
}

function log10(x) {
    return Math.log(x) / Math.LN10;
}

function crossesZero(domain) {
    return (
        domain[0] === 0 ||
        domain[1] === 0 ||
        domain[0] > 0 !== domain[1] > 0
    );
}
