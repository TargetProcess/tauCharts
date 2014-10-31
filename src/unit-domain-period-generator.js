var PERIODS_MAP = {

    'day': {
        cast: function (date) {
            return new Date(date.setHours(0, 0, 0, 0));
        },
        next: function (prevDate) {
            return new Date(prevDate.setDate(prevDate.getDate() + 1));
        }
    },

    'week': {
        cast: function (date) {
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(date.getDate() - date.getDay()));
            return date;
        },
        next: function (prevDate) {
            return new Date(prevDate.setDate(prevDate.getDate() + 7));
        }
    },

    'month': {
        cast: function (date) {
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            return date;
        },
        next: function (prevDate) {
            return new Date(prevDate.setMonth(prevDate.getMonth() + 1));
        }
    },

    'quarter': {
        cast: function (date) {
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            var currentMonth = date.getMonth();
            var firstQuarterMonth = currentMonth - (currentMonth % 3);
            return new Date(date.setMonth(firstQuarterMonth));
        },
        next: function (prevDate) {
            return new Date(prevDate.setMonth(prevDate.getMonth() + 3));
        }
    },

    'year': {
        cast: function (date) {
            date = new Date(date.setHours(0, 0, 0, 0));
            date = new Date(date.setDate(1));
            date = new Date(date.setMonth(0));
            return date;
        },
        next: function (prevDate) {
            return new Date(prevDate.setFullYear(prevDate.getFullYear() + 1));
        }
    }
};

var UnitDomainPeriodGenerator = {

    add: function(periodAlias, obj) {
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