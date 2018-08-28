export interface PeriodGenerator {
    cast: (this: PeriodGenerator, d: Date) => Date;
    next: (this: PeriodGenerator, d: Date) => Date;
}

interface PeriodMap {
    [name: string]: PeriodGenerator;
}

interface DateMethods {
    setHours: string;
    setDate: string;
    getDate: string;
    getDay: string;
    setMonth: string;
    getMonth: string;
    setFullYear: string;
    getFullYear: string;
}

const localDateMethods: DateMethods = {
    setHours: 'setHours',
    setDate: 'setDate',
    getDate: 'getDate',
    setMonth: 'setMonth',
    getDay: 'getDay',
    getMonth: 'getMonth',
    setFullYear: 'setFullYear',
    getFullYear: 'getFullYear',
};

const UTCDateMethods = {
    setHours: 'setUTCHours',
    setDate: 'setUTCDate',
    getDate: 'getUTCDate',
    setMonth: 'setUTCMonth',
    getDay: 'getUTCDay',
    getMonth: 'getUTCMonth',
    setFullYear: 'setUTCFullYear',
    getFullYear: 'getUTCFullYear',
};

const createPeriodMap = (dateMethods) => ({

    day: {
        cast: function (d) {
            var date = new Date(d);
            return new Date(date[dateMethods.setHours](0, 0, 0, 0));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev[dateMethods.setDate](prev[dateMethods.getDate]() + 1));
            return this.cast(next);
        }
    },

    week: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date[dateMethods.setHours](0, 0, 0, 0));
            return new Date(date[dateMethods.setDate](date[dateMethods.getDate]() - date[dateMethods.getDay]()));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = (new Date(prev[dateMethods.setDate](prev[dateMethods.getDate]() + 7)));
            return this.cast(next);
        }
    },

    month: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date[dateMethods.setHours](0, 0, 0, 0));
            date = new Date(date[dateMethods.setDate](1));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev[dateMethods.setMonth](prev[dateMethods.getMonth]() + 1));
            return this.cast(next);
        }
    },

    quarter: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date[dateMethods.setHours](0, 0, 0, 0));
            date = new Date(date[dateMethods.setDate](1));
            var currentMonth = date[dateMethods.getMonth]();
            var firstQuarterMonth = currentMonth - (currentMonth % 3);
            return new Date(date[dateMethods.setMonth](firstQuarterMonth));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev[dateMethods.setMonth](prev[dateMethods.getMonth]() + 3));
            return this.cast(next);
        }
    },

    year: {
        cast(d) {
            var date = new Date(d);
            date = new Date(date[dateMethods.setHours](0, 0, 0, 0));
            date = new Date(date[dateMethods.setDate](1));
            date = new Date(date[dateMethods.setMonth](0));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev[dateMethods.setFullYear](prev[dateMethods.getFullYear]() + 1));
            return this.cast(next);
        }
    }
});

const PERIODS_MAP: PeriodMap = createPeriodMap(localDateMethods);

var PERIODS_MAP_UTC: PeriodMap = createPeriodMap(UTCDateMethods);

var UnitDomainPeriodGenerator = {

    add(periodAlias: string, obj: PeriodGenerator, {utc} = {utc: false}) {
        (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[periodAlias.toLowerCase()] = obj;
        return this;
    },

    get(periodAlias: string, {utc} = {utc: false}) {
        var alias = periodAlias || '';
        return (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[alias.toLowerCase()] || null;
    },

    generate: (
        lTick: Date | number | string,
        rTick: Date | number | string,
        periodAlias: string,
        {utc} = {utc: false}
    ) => {
        var r: Date[] = [];
        var period = UnitDomainPeriodGenerator.get(periodAlias, {utc});
        if (period) {
            var last = period.cast(new Date(<any>rTick));
            var curr = period.cast(new Date(<any>lTick));
            r.push(curr);
            while ((curr = period.next(new Date(curr))) <= last) {
                r.push(curr);
            }
        }
        return r;
    }
};

export {UnitDomainPeriodGenerator};
