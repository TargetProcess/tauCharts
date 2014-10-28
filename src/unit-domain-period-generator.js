var PERIODS_MAP = {

    'day': {
        take: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setHours(0, 0, 0, 0));
        },
        next: function (prevTick) {
            var prevDate = new Date(prevTick);
            return new Date(prevDate.setDate(prevDate.getDate() + 1));
        }
    },

    'week': {
        take: function (prevTick) {
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
        take: function (prevTick) {
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
        take: function (prevTick) {
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
        take: function (prevTick) {
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

    get: (periodAlias) => PERIODS_MAP[periodAlias].take,

    generate: (lTick, rTick, periodAlias, fnIterator) => {
        var period = PERIODS_MAP[periodAlias];
        if (period) {
            var last = period.take(rTick);
            var curr = period.take(lTick);
            fnIterator(curr);
            while ((curr = period.next(curr)) <= last) {
                fnIterator(curr);
            }
        }
    }
};

export {UnitDomainPeriodGenerator};