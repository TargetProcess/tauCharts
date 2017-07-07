import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import {UnitDomainPeriodGenerator, PeriodGenerator} from '../unit-domain-period-generator';
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
            const d3Ticks = d3Scale.ticks;
            d3Scale.ticks = (count?) => {
                if (typeof count !== 'number') {
                    count = 10;
                }
                return getPeriodTicks([min, max], this.scaleConfig.period, utcTime, count);
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

function getD3Interval(name: string) {
    return d3[`time${name[0].toUpperCase()}${name.slice(1)}`];
}

function getD3UtcInterval(name: string) {
    return d3[`utc${name[0].toUpperCase()}${name.slice(1)}`];
}

function getPeriodTicks(domain: Date[], period: string, utc: boolean, count = 10) {

    const [start, end] = domain;
    const gen = UnitDomainPeriodGenerator.get(period, {utc});
    const n0 = Number(start);
    const n1 = Number(end);
    const interval = ((n1 - n0) / count);
    const periodInterval = (Number(gen.next(gen.cast(start))) - Number(gen.cast(start)));
    const periodCount = ((n1 - n0) / periodInterval);

    if (periodCount <= count) {
        return UnitDomainPeriodGenerator.generate(
            start,
            end,
            period,
            {utc})
            .filter((t) => t >= start && t <= end);
    }

    return d3_getTimeTicks(domain.map(Number), utc);
}

function d3_getTimeTicks(domain, utc, count = 10) {

    const millisecond = utc ? d3.utcMillisecond : d3.timeMillisecond;
    const second = utc ? d3.utcSecond : d3.timeSecond;
    const minute = utc ? d3.utcMinute : d3.timeMinute;
    const hour = utc ? d3.utcHour : d3.timeHour;
    const day = utc ? d3.utcDay : d3.timeDay;
    const week = utc ? d3.utcWeek : d3.timeWeek;
    const month = utc ? d3.utcMonth : d3.timeMonth;
    const year = utc ? d3.utcYear : d3.timeYear;

    const durationSecond = 1000;
    const durationMinute = durationSecond * 60;
    const durationHour = durationMinute * 60;
    const durationDay = durationHour * 24;
    const durationWeek = durationDay * 7;
    const durationMonth = durationDay * 30;
    const durationYear = durationDay * 365;

    const tickIntervals: ([any, number, number])[] = [
        [second, 1, durationSecond],
        [second, 5, 5 * durationSecond],
        [second, 15, 15 * durationSecond],
        [second, 30, 30 * durationSecond],
        [minute, 1, durationMinute],
        [minute, 5, 5 * durationMinute],
        [minute, 15, 15 * durationMinute],
        [minute, 30, 30 * durationMinute],
        [hour, 1, durationHour],
        [hour, 3, 3 * durationHour],
        [hour, 6, 6 * durationHour],
        [hour, 12, 12 * durationHour],
        [day, 1, durationDay],
        [day, 2, 2 * durationDay],
        [week, 1, durationWeek],
        [month, 1, durationMonth],
        [month, 3, 3 * durationMonth],
        [year, 1, durationYear]
    ];

    function tickInterval(start, stop) {

        const duration = Math.abs(stop - start) / count;

        var interval;
        var i = d3.bisector((i) => i[2]).right(tickIntervals, duration);
        if (i === tickIntervals.length) {
            interval = year;
        } else if (i) {
            let ti = tickIntervals[duration / tickIntervals[i - 1][2] < tickIntervals[i][2] / duration ? i - 1 : i];
            interval = ti[0];
        } else {
            interval = millisecond;
        }

        return interval;
    }

    function ticks() {
        const d = domain;
        const t0 = d[0];
        const t1 = d[d.length - 1];
        const t = tickInterval(t0, t1);
        const ticks = t.range(t0, t1 + 1); // inclusive stop
        return ticks;
    }

    return ticks();
}
