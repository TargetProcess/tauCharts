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

var UnitDomainPeriodGenerator = {

    add: function (periodAlias, obj) {
        PERIODS_MAP[periodAlias.toLowerCase()] = obj;
        return this;
    },

    get: (periodAlias) => PERIODS_MAP[periodAlias.toLowerCase()],

    generate: (lTick, rTick, periodAlias) => {
        var r = [];
        var period = PERIODS_MAP[periodAlias.toLowerCase()];
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