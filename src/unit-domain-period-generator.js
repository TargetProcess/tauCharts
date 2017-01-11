var PERIODS_MAP = {

    day: {
        cast: function (d) {
            var date = new Date(d);
            return new Date(date.setHours(0, 0, 0, 0));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setDate(prev.getDate() + 1));
            return this.cast(next);
        }
    },

    week: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setHours(0, 0, 0, 0));
            return new Date(date.setDate(date.getDate() - date.getDay()));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = (new Date(prev.setDate(prev.getDate() + 7)));
            return this.cast(next);
        }
    },

    month: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setMonth(prev.getMonth() + 1));
            return this.cast(next);
        }
    },

    quarter: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            var currentMonth = date.getMonth();
            var firstQuarterMonth = currentMonth - (currentMonth % 3);
            return new Date(date.setMonth(firstQuarterMonth));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setMonth(prev.getMonth() + 3));
            return this.cast(next);
        }
    },

    year: {
        cast(d) {
            var date = new Date(d);
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            date = new Date(date.setMonth(0));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setFullYear(prev.getFullYear() + 1));
            return this.cast(next);
        }
    }
};

var PERIODS_MAP_UTC = {

    day: {
        cast: function (d) {
            var date = new Date(d);
            return new Date(date.setUTCHours(0, 0, 0, 0));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setUTCDate(prev.getDate() + 1));
            return this.cast(next);
        }
    },

    week: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setUTCHours(0, 0, 0, 0));
            return new Date(date.setUTCDate(date.getDate() - date.getDay()));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = (new Date(prev.setUTCDate(prev.getDate() + 7)));
            return this.cast(next);
        }
    },

    month: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setUTCHours(0, 0, 0, 0));
            date = new Date(date.setUTCDate(1));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setUTCMonth(prev.getMonth() + 1));
            return this.cast(next);
        }
    },

    quarter: {
        cast: function (d) {
            var date = new Date(d);
            date = new Date(date.setUTCHours(0, 0, 0, 0));
            date = new Date(date.setUTCDate(1));
            var currentMonth = date.getMonth();
            var firstQuarterMonth = currentMonth - (currentMonth % 3);
            return new Date(date.setUTCMonth(firstQuarterMonth));
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setUTCMonth(prev.getMonth() + 3));
            return this.cast(next);
        }
    },

    year: {
        cast(d) {
            var date = new Date(d);
            date = new Date(date.setUTCHours(0, 0, 0, 0));
            date = new Date(date.setUTCDate(1));
            date = new Date(date.setUTCMonth(0));
            return date;
        },
        next: function (d) {
            var prev = new Date(d);
            var next = new Date(prev.setUTCFullYear(prev.getFullYear() + 1));
            return this.cast(next);
        }
    }
};

var UnitDomainPeriodGenerator = {

    add: function (periodAlias, obj, {utc} = {utc: false}) {
        (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[periodAlias.toLowerCase()] = obj;
        return this;
    },

    get: (periodAlias, {utc} = {utc: false}) => {
        var alias = periodAlias || '';
        return (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[alias.toLowerCase()] || null;
    },

    generate: (lTick, rTick, periodAlias) => {
        var r = [];
        var period = UnitDomainPeriodGenerator.get(periodAlias);
        if (period) {
            var last = period.cast(new Date(rTick));
            var curr = period.cast(new Date(lTick));
            r.push(curr);
            while ((curr = period.next(new Date(curr))) <= last) {
                r.push(curr);
            }
        }
        return r;
    }
};

export {UnitDomainPeriodGenerator};