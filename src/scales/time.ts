import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import {UnitDomainPeriodGenerator, PeriodGenerator} from '../unit-domain-period-generator';
import * as d3 from 'd3';
import * as utils from '../utils/utils';
import {
    ScaleConfig,
    ScaleFunction
} from '../definitions';

export class TimeScale extends BaseScale {

    vars: Date[];
    niceIntervalFn: d3.CountableTimeInterval;
    periodGenerator: PeriodGenerator;

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        var props = this.scaleConfig;
        var vars = this.vars;
        const period = (props.period ?
            UnitDomainPeriodGenerator.get(this.scaleConfig.period, {utc: props.utcTime}) :
            null);

        const domain = (d3.extent(vars) as [Date, Date]).map(period ?
            (v) => period.cast(new Date(v)) :
            (v) => new Date(v));

        const min = (props.min == null) ? domain[0] : new Date(props.min).getTime();
        const max = (props.max == null) ? domain[1] : new Date(props.max).getTime();

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

        if (period && Number(this.vars[0]) === Number(this.vars[1])) {
            // Note: If domain start and end is the same
            // extend domain with one time interval
            this.vars[1] = period.next(this.vars[0]);
        }

        this.periodGenerator = period;

        this.addField('scaleType', 'time');
    }

    isInDomain(aTime) {
        var x = new Date(aTime);
        if (this.scaleConfig.period) {
            x = this.periodGenerator.cast(x);
        }
        var domain = this.domain();
        var min = domain[0];
        var max = domain[domain.length - 1];
        return (!Number.isNaN(min) && !Number.isNaN(max) && (x <= max) && (x >= min));
    }

    create(interval) {

        var varSet = this.vars;
        var utcTime = this.scaleConfig.utcTime;
        const period = this.periodGenerator;

        var d3TimeScale = (utcTime ? d3.scaleUtc : d3.scaleTime);

        const d3Scale = d3TimeScale()
            .domain(varSet)
            .range(interval);

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

        if (this.scaleConfig.period) {
            const [min, max] = varSet;
            d3Scale.ticks = () => {
                return UnitDomainPeriodGenerator.generate(
                    min,
                    max,
                    this.scaleConfig.period, {utc: utcTime})
                    .filter((t) => t >= min && t <= max);
            };
            scale = ((x) => {
                const floor = period.cast(x);
                return d3Scale(floor);
            }) as ScaleFunction;
        }

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.stepSize = (() => 0);

        return this.toBaseScale(scale, interval);
    }
}