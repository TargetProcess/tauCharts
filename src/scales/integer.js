import {BaseScale} from './base';
import {utils} from '../utils/utils';
import d3 from 'd3';

export class IntegerScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var domain = d3.extent(this.vars);

        var min = Number.isFinite(props.min) ? props.min : domain[0];
        var max = Number.isFinite(props.max) ? props.max : domain[1];

        domain = [
            Math.min(...[min, domain[0]].filter(Number.isFinite)),
            Math.max(...[max, domain[1]].filter(Number.isFinite))
        ];

        this.vars = (props.nice) ? utils.niceZeroBased(domain) : d3.extent(domain);

        this.addField('scaleType', 'integer')
            .addField('discrete', false);
    }

    isInDomain(x) {
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!Number.isNaN(min) && !Number.isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval) {

        var domain = this.vars;

        var scale = extendScale(d3.scale.linear());
        scale
            .domain(domain)
            .rangeRound(interval, 1);

        return this.toBaseScale(scale, interval);
    }
}

function extendScale(d3Scale) {

    var scale = (int) => {
        var domain = d3.extent(scale.domain());
        var min = domain[0];
        var max = domain[1];
        var x = int;
        if (x > max) {
            x = max;
        }
        if (x < min) {
            x = min;
        }

        return d3Scale(x);
    };

    Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

    scale.stepSize = (() => 0);

    scale.ticks = (n) => {

        var extent = d3.extent(scale.domain());
        var crossesZero = (extent[0] * extent[1] < 0);

        var log10 = (x) => Math.log(x) / Math.LN10;
        var getExp = (x) => Math.floor(log10(Math.abs(x)));
        var exp = Math.max(
            getExp(extent[0]),
            getExp(extent[1])
        );
        var exp10 = Math.pow(10, exp);

        var ticks = [];
        var addTicks = (low, top) => {
            utils.range(low, top + 1)
                .forEach(d => ticks.push(d * exp10))
        };

        if (extent[0] < 0) {
            // Ticks below zero
            var start = Math.ceil(extent[0] / exp10);
            var end = Math.ceil(Math.min(0, extent[1]) / exp10);
            if (start < 0) {
                addTicks(start, Math.min(-1, end));
            }
        }
        if (extent[0] * extent[1] < 0) {
            // Zero tick
            ticks.push(0);
        }

        if (extent[1] > 0) {
            // Ticks above zero
            var start = Math.floor(Math.max(0, extent[0]) / exp10);
            var end = Math.floor(extent[1] / exp10);
            if (end > 0) {
                addTicks(Math.max(1, start), end);
            }
        }

        return ticks;
    };

    scale.copy = () => {
        var copy = d3Scale.copy();
        return extendScale(copy);
    };

    return scale;
}
