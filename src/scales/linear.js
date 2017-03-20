import {BaseScale} from './base';
import {utils} from '../utils/utils';
import d3 from 'd3';

export class LinearScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = d3.extent(this.vars);

        var min = Number.isFinite(props.min) ? props.min : vars[0];
        var max = Number.isFinite(props.max) ? props.max : vars[1];

        vars = [
            Math.min(...[min, vars[0]].filter(Number.isFinite)),
            Math.max(...[max, vars[1]].filter(Number.isFinite))
        ];

        this.vars = (props.nice) ? utils.niceZeroBased(vars) : d3.extent(vars);
        if (this.vars[0] === this.vars[1]) {
            var e = Math.pow(10, Math.floor(Math.log(this.vars[0]) / Math.LN10));
            this.vars[0] -= (e);
            this.vars[1] += (e || 10);
        }

        this.addField('scaleType', 'linear')
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

        var scale = this.extendScale(d3.scale.linear());
        scale
            .domain(domain)
            .range(interval)
            .clamp(true);

        return this.toBaseScale(scale, interval);
    }

    extendScale(scale) {

        // have to copy properties since d3 produce Function with methods
        var d3ScaleCopy = scale.copy;
        var d3ScaleTicks = scale.ticks;
        Object.assign(scale, {

            stepSize: () => 0,

            copy: () => this.extendScale(d3ScaleCopy.call(scale)),

            ticks: (this.getField('isInteger') ?
                (n) => d3ScaleTicks.call(scale, n).filter(Number.isInteger) :
                scale.ticks
            )
        });

        return scale;
    }
}