import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time'
const d3 = {
    ...d3Array,
    ...d3Scale,
    ...d3Time,
};
import * as utils from '../utils/utils';
import {
    ScaleConfig,
    ScaleFunction
} from '../definitions';

export class TimeScale extends BaseScale {

    vars: Date[];
    niceIntervalFn: d3.CountableTimeInterval;

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;

        var domain = (d3.extent(vars) as [Date, Date]).map((v) => new Date(v));

        var min = (props.min === null || props.min === undefined) ? domain[0] : new Date(props.min).getTime();
        var max = (props.max === null || props.max === undefined) ? domain[1] : new Date(props.max).getTime();

        vars = [
            new Date(Math.min(min as number, Number(domain[0]))),
            new Date(Math.max(max as number, Number(domain[1])))
        ];

        this.niceIntervalFn = null;
        if (props.nice) {
            var niceInterval = props.niceInterval;
            // Todo: Some map for d3 intervals.
            var getD3Interval = (n: string) => d3[`time${n[0].toUpperCase()}${n.slice(1)}`];
            var getD3UtcInterval = (n: string) => d3[`utc${n[0].toUpperCase()}${n.slice(1)}`];
            var d3TimeInterval = (niceInterval && getD3Interval(niceInterval) ?
                (props.utcTime ? getD3UtcInterval(niceInterval) : getD3Interval(niceInterval)) :
                null);
            if (d3TimeInterval) {
                this.niceIntervalFn = d3TimeInterval;
            } else {
                // TODO: show warning?
                this.niceIntervalFn = null;
            }

            this.vars = utils.niceTimeDomain(vars, this.niceIntervalFn, {utc: props.utcTime});

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
        var utcTime = this.scaleConfig.utcTime;

        var d3TimeScale = (utcTime ? d3.scaleUtc : d3.scaleTime);
        var d3Domain = d3TimeScale().domain(
            this.scaleConfig.nice ?
                utils.niceTimeDomain(varSet, this.niceIntervalFn, {utc: utcTime}) :
                varSet
        );

        var d3Scale = d3Domain.range(interval);

        var scale = ((x) => {
            var min = varSet[0];
            var max = varSet[1];

            if (x > max) {
                x = max;
            }
            if (x < min) {
                x = min;
            }
            return d3Scale(new Date(x));
        }) as ScaleFunction;

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.stepSize = (() => 0);

        return this.toBaseScale(scale, interval);
    }
}