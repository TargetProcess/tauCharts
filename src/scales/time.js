import {BaseScale} from './base';
import d3 from 'd3';
import {utils} from '../utils/utils';

export class TimeScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;

        var domain = d3.extent(vars).map((v) => new Date(v));

        var min = (props.min === null || props.min === undefined) ? domain[0] : new Date(props.min).getTime();
        var max = (props.max === null || props.max === undefined) ? domain[1] : new Date(props.max).getTime();

        vars = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        this.niceIntervalFn = null;
        if (props.nice) {
            var niceInterval = props.niceInterval;
            if (d3.time[niceInterval]) {
                this.niceIntervalFn = d3.time[niceInterval];
            } else {
                // TODO: show warning?
                this.niceIntervalFn = null;
            }

            this.vars = utils.niceTimeDomain(vars, this.niceIntervalFn);

        } else {
            this.vars = vars;
        }

        this.addField('scaleType', 'time');
    }

    isInDomain(aTime) {
        var x = new Date(aTime);
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!Number.isNaN(min) && !Number.isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval) {

        var varSet = this.vars;

        var d3Domain = d3.time.scale().domain(
            this.scaleConfig.nice ?
                utils.niceTimeDomain(varSet, this.niceIntervalFn) :
                varSet
        );

        var d3Scale = d3Domain.range(interval);

        var scale = (x) => {
            var min = varSet[0];
            var max = varSet[1];

            if (x > max) {
                x = max;
            }
            if (x < min) {
                x = min;
            }
            return d3Scale(new Date(x));
        };

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.stepSize = (() => 0);

        return this.toBaseScale(scale, interval);
    }
}