import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import {UnitDomainPeriodGenerator, PeriodGenerator} from '../unit-domain-period-generator';
import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time';
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
        if (props.nice && !period) {
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
            // Note: If domain start and end are the same
            // extend domain with one time interval at each side
            let mid = this.vars[0];
            this.vars[0] = period.cast(new Date(Number(mid) - 1));
            this.vars[1] = period.next(mid);
        }

        this.periodGenerator = period;

        this.addField('scaleType', 'time')
            .addField('utcTime', this.scaleConfig.utcTime)
            .addField('period', this.scaleConfig.period);
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
            let floorMin = period.cast(min);
            while (floorMin < min) {
                floorMin = period.next(floorMin);
            }
            const floorMax = period.cast(max);
            scale = ((x) => {
                let floor = period.cast(x);
                if (floor < floorMin) {
                    floor = floorMin;
                }
                if (floor > floorMax) {
                    floor = floorMax;
                }
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

    return getTimeTicks(domain, utc, count);
}

interface IntervalInfo {
    interval: d3.CountableTimeInterval;
    utc: d3.CountableTimeInterval;
    duration: number;
}

const time = (() => {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    return {
        second: {duration: second, interval: d3.timeSecond, utc: d3.utcSecond},
        minute: {duration: minute, interval: d3.timeMinute, utc: d3.utcMinute},
        hour: {duration: hour, interval: d3.timeHour, utc: d3.utcHour},
        day: {duration: day, interval: d3.timeDay, utc: d3.utcDay},
        week: {duration: week, interval: d3.timeWeek, utc: d3.utcWeek},
        month: {duration: month, interval: d3.timeMonth, utc: d3.utcMonth},
        year: {duration: year, interval: d3.timeYear, utc: d3.utcYear},
    };
})();

interface SortedIntervalInfo {
    time: IntervalInfo;
    step: number;
    duration: number;
}

const intervals = (() => {
    const info = (time: IntervalInfo, step: number) => {
        const duration = (step * time.duration);
        return {time, step, duration};
    };
    return [
        info(time.second, 1),
        info(time.second, 5),
        info(time.second, 15),
        info(time.second, 30),
        info(time.minute, 1),
        info(time.minute, 5),
        info(time.minute, 15),
        info(time.minute, 30),
        info(time.hour, 1),
        info(time.hour, 3),
        info(time.hour, 6),
        info(time.hour, 12),
        info(time.day, 1),
        info(time.day, 2),
        info(time.week, 1),
        info(time.month, 1),
        info(time.month, 3),
        info(time.year, 1),
    ];
})();

function getTimeTicks(domain: Date[], utc: boolean, count = 10) {

    const d0 = Number(domain[0]);
    const d1 = Number(domain[1]);

    const target = Math.abs(d1 - d0) / count;

    var interval: d3.CountableTimeInterval;
    var step: number;
    const i = d3.bisector((i: SortedIntervalInfo) => i.duration).right(intervals, target);
    if (i === intervals.length) {
        interval = (utc ? d3.utcYear : d3.timeYear);
        step = d3.tickStep((d0 / time.year.duration), (d1 / time.year.duration), count);
    } else if (i) {
        let before = (target / intervals[i - 1].duration);
        let after = (intervals[i].duration / target);
        let ti = intervals[before < after ? i - 1 : i];
        interval = (utc ? ti.time.utc : ti.time.interval);
        step = ti.step;
    } else {
        interval = (utc ? d3.utcMillisecond : d3.timeMillisecond);
        step = d3.tickStep(d0, d1, count);
    }

    return interval
        .every(step)
        .range(new Date(d0), new Date(d1 + 1));
}
