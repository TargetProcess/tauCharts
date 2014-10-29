var PERIODS_MAP = {

    'day': {
        cast: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setHours(0, 0, 0, 0));
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setDate(prevDate.getDate() + 1));
        }
    },

    'week': {
        cast: function (prevTick) {
            var prevDate = new Date(prevTick);
            prevDate = new Date(prevDate.setHours(0, 0, 0, 0));
            prevDate = new Date(prevDate.setDate(prevDate.getDate() - prevDate.getDay()));
            return prevDate;
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setDate(prevDate.getDate() + 7));
        }
    },

    'month': {
        cast: function (prevTick) {
            var prevDate = new Date(prevTick);
            prevDate = new Date(prevDate.setHours(0, 0, 0, 0));
            prevDate = new Date(prevDate.setDate(1));
            return prevDate;
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setMonth(prevDate.getMonth() + 1));
        }
    },

    'quarter': {
        cast: function (prevTick) {
            var prevDate = new Date(prevTick);
            prevDate = new Date(prevDate.setHours(0, 0, 0, 0));
            prevDate = new Date(prevDate.setDate(1));
            var currentMonth = prevDate.getMonth();
            var firstQuarterMonth = currentMonth - (currentMonth % 3);
            return new Date(prevDate.setMonth(firstQuarterMonth));
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setMonth(prevDate.getMonth() + 3));
        }
    },

    'year': {
        cast: function (prevTick) {
            var prevDate = new Date(prevTick);
            prevDate = new Date(prevDate.setHours(0, 0, 0, 0));
            prevDate = new Date(prevDate.setDate(1));
            prevDate = new Date(prevDate.setMonth(0));
            return prevDate;
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
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
            var last = period.cast(rTick);
            var curr = period.cast(lTick);
            r.push(curr);
            while ((curr = period.next(curr)) <= last) {
                r.push(curr);
            }
        }
        return r;
    }
};

export {UnitDomainPeriodGenerator};